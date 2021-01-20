const NotificationJob = require('../Notification/NotificationJob.model');
const Section = require('../Section/Section.model');
const User = require('../User/User.model');
const QRScan = require('../QRScan/QRScan.model');
const Video = require('../Video/Video.model');
const schedule = require('node-schedule');

module.exports = {
  addMeetingToObjects,
  getAllStudentsFromSections,
  createQRScans,
  createVideos
}

async function addMeetingToObjects(object_ids, object_type, meeting_id) {
  try {
    let update_promises = []
    object_ids.forEach(object_id => {
      update_promises.push(new Promise(async (resolve,reject) => {
        if(object_type === "section") {
          Section.findByIdAndUpdate(object_id,
            {$push: {meetings: meeting_id}},
            {new: true},
            (error, section) => {
              if(error) {
                console.log("<ERROR> (meetings/add) updating section",error)
                reject(section)
              } else {
                resolve(section)
              }
            }
          )
        } else if(object_type === "user") {
          User.findByIdAndUpdate(object_id,
            {$push: {meetings: meeting_id}},
            {new: true},
            (error, user) => {
              if(error) {
                console.log("<ERROR> (meetings/add) updating user",error)
                reject(user)
              } else {
                resolve(user)
              }
            }
          )
        }
      }))
    })
    let updated_objects = await Promise.all(update_promises)
    return updated_objects
  } catch(error) {
    console.log("<ERROR> in addMeetingToObjects for object_ids",
     object_ids,"with object type",object_type,"and meeting_id",meeting_id,error)
    return null
  }
}

function getAllStudentsFromSections(sections) {
  let all_students = []
  sections.forEach(section => {
    all_students = all_students.concat(section.students)
  })
  return all_students
}

async function createQRScans(qr_scans, instructor_id, meeting_id) {
  try {
    let qr_scan_promises = []
    let notifcation_schedule_promises = []
    for(let i = 0; i < qr_scans.length; i++) {
      qr_scan_promises.push(new Promise(async (resolve, reject) => {
        const random_code = generateRandomCode() 
        const qr_scan = new QRScan({
          code: random_code,
          reminder_time: qr_scans[i].reminder_time
        })
        const saved_qr_scan = await qr_scan.save()
        resolve(saved_qr_scan)
      }))
      const reminder_time = qr_scans[i].reminder_time
      if(reminder_time != null) {
        console.log("reminder_time", reminder_time)
        notifcation_schedule_promises.push(new Promise(async (resolve, reject) => {
          const updated_notification_job = await scheduleShowQRNotification(
            reminder_time, instructor_id, meeting_id)
          if(updated_notification_job == null)
            reject(null)
          else
            resolve(updated_notification_job)
        }))
      }
    }
    const saved_qr_scans = await Promise.all(qr_scan_promises)
    const updated_notification_jobs = await 
      Promise.all(notifcation_schedule_promises)
    return [saved_qr_scans, updated_notification_jobs]
  } catch(error) {
    console.log(`<ERROR> createQRScans qr_scans: ${qr_scans}`, error)
    return [null, null]
  }
}

async function createVideos(videos) {
  try {
    let video_promises = []
    videos.forEach(video => {
      video_promises.push(new Promise(async (resolve, reject) => {
        const new_video = new Video({
          name: video.name,
          url: video.url
        })
        const saved_video = await new_video.save()
        resolve(saved_video)
      }))
    })
    const saved_videos = await Promise.all(video_promises)
    return saved_videos
  } catch(error) {
    console.log(`<ERROR> createVideos videos:`,videos, error)
    return null
  }
}

function generateRandomCode() {
  const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 100; i > 0; --i) {
    result += alnums[Math.floor(Math.random() * alnums.length)];
  }
  return result;
}

async function scheduleShowQRNotification(
  scheduled_time, instructor_id, meeting_id) {
  try {
    const notification_job = new NotificationJob({
      scheduled_time: scheduled_time,
      primary_instructor_id: instructor_id,
      secondary_instructor_id: "null",
      meeting_id: meeting_id
    })
    const saved_notification_job = await notification_job.save()

    const job = schedule.scheduleJob(scheduled_time, function(){
      saved_notification_job.sendScheduledShowQRNotificationsToInstructors()
      NotificationJob.findByIdAndRemove(saved_notification_job._id, (error) => {
        if (error) {
          console.log("<ERROR> (scheduleShowQRNotification) Deleting NotificationJob with ID:",
            saved_notification_job._id, error)
        } else {
          console.log("<SUCCESS> (scheduleShowQRNotification) Deleting NotificationJob")
        }
      });
    });

    // The global index is used to reschedule all notifications on server
    // restarts
    all_notification_jobs.push(job)
    const global_index = all_notification_jobs.length - 1
    const update_promise = new Promise((resolve, reject) => {
      NotificationJob.findByIdAndUpdate(saved_notification_job._id,
        {global_index: global_index},
        (error, notification_job) => {
          if(error || notification_job == null) {
            console.log("<ERROR> (scheduleShowQRNotification) Updating NotificationJob with ID:",
              saved_notification_job._id, error)
            reject(error)
          } else {
            resolve(notification_job)
          }
        }
      )
    })
    const updated_notification_job = await Promise.resolve(update_promise)
    return updated_notification_job
  } catch(error) {
    console.log(`<ERROR> (scheduleShowQRNotification) scheduled_time:`
      + ` ${scheduled_time} instructor_id: ${instructor_id}`
      + ` meeting_id: ${meeting_id}`, error)
    return null
  }
}