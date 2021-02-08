const NotificationJob = require('../Notification/NotificationJob.model');
const schedule = require('node-schedule');
const moment = require("moment");

module.exports = {scheduleShowQRNotification,
  rescheduleAllNotificationJobs}

async function scheduleShowQRNotification(
  scheduled_time, instructor_ids, meeting_id, qr_scan_id) {
  try {
    const notification_job = new NotificationJob({
      scheduled_time: scheduled_time,
      instructor_ids: instructor_ids,
      meeting_id: meeting_id,
      qr_scan_id: qr_scan_id
    })
    const saved_notification_job = await notification_job.save()
    const job = scheduleNotificationJob(saved_notification_job)

    // The global index is used to reschedule all notifications on server
    // restarts
    all_notification_jobs.push(job)
    const global_index = all_notification_jobs.length - 1
    const updated_notification_job =
      await updateNotificationJobGlobalIndex(
        saved_notification_job._id, global_index)
    if(updated_notification_job == null)
      throw "<ERROR> updating notification job global_index"
    return updated_notification_job
  } catch(error) {
    console.log(`<ERROR> (scheduleShowQRNotification) scheduled_time:`
      + ` ${scheduled_time} instructor_ids: `, instructor_ids
      + ` meeting_id: ${meeting_id}`, error)
    return null
  }
}

async function rescheduleAllNotificationJobs() {
  global.all_notification_jobs = []
  try {
    const get_all_notification_jobs_promise = new Promise(
      (resolve, reject) => {
        NotificationJob.find(
          function(error, notification_jobs) {
            if(error) {
              console.log("<ERROR> rescheduleAllNotificationJobs "
                + "getting notification jobs", error)
              reject(null)
            } else {
              resolve(notification_jobs)
            }
          }
        )
      }
    )
    const notification_jobs = await Promise.resolve(
      get_all_notification_jobs_promise)

    const deletion_promises = []
    const reschedule_promises = []
    notification_jobs.forEach(notification_job => {
      const current_time = Date.now()
      if(moment(notification_job.scheduled_time).isBefore(
        current_time)) {
        deletion_promises.push(deleteNotificationJob(
          notification_job._id))
      } else {
        reschedule_promises.push(rescheduleNotificationJob(
          notification_job))
      }
    })
    const deletion_statuses = await Promise.all(deletion_promises)
    if(deletion_statuses.includes(false))
      throw "<ERROR> deleting notification jobs"
    const rescheduled_jobs = await Promise.all(reschedule_promises)
    if(rescheduled_jobs.includes(null))
      throw "<ERROR> rescheduling notification jobs"
    let num_global_indices_updated = 0
    rescheduled_jobs.forEach(reschedule_status => {
      if(reschedule_status[1])
        num_global_indices_updated++
    })
    console.log(`<SUCCESS> rescheduleAllNotificationJobs\n`
      + `${deletion_statuses.length} old notification jobs deleted\n`
      + `${rescheduled_jobs.length} upcoming notification jobs rescheduled\n`
      + `${num_global_indices_updated} global indices updated\n`)
  } catch(error) {
    console.log("<ERROR> rescheduleAllNotificationJobs", error)
  }
}

async function deleteNotificationJob(notification_job_id) {
  try {
    const deletion_promise = new Promise((resolve, reject) => {
      NotificationJob.findByIdAndRemove(notification_job_id,
        (error) => {
          if(error) {
            console.log("<ERROR> rescheduleAllNotificationJobs deleting"
              + ` notification_job with id ${notification_job_id}`,
              error)
            reject(null)
          } else {
            resolve(true)
          }
        }
      )
    })
    await Promise.resolve(deletion_promise)
    return true
  } catch(error) {
    console.log(`<ERROR> deleteNotificationJob notification_job_id`
      + ` ${notification_job_id}`, error)
    return false
  }
}

async function rescheduleNotificationJob(notification_job) {
  try {
    console.log(`Rescheduling job for `
      + `${new Date(notification_job.scheduled_time)}`)
    const job = scheduleNotificationJob(notification_job)
    all_notification_jobs.push(job)
    const global_index = all_notification_jobs.length - 1
    let global_index_was_updated = false
    if(notification_job.global_index !== global_index) {
      const updated_notification_job =
        await updateNotificationJobGlobalIndex(
          notification_job._id, global_index)
      global_index_was_updated = true
      if(updated_notification_job == null)
        throw "<ERROR> updating notification job global index"
    }
    return [notification_job, global_index_was_updated]
  } catch(error) {
    console.log("<ERROR> rescheduleNotificationJob notification_job",
      notification_job, error)
    return null
  }
}

function scheduleNotificationJob(notification_job) {
  const job = schedule.scheduleJob(notification_job.scheduled_time,
    function() {
    notification_job.sendScheduledShowQRNotificationsToInstructors()
    NotificationJob.findByIdAndRemove(
      notification_job._id, (error) => {
      if (error) {
        console.log("<ERROR> scheduleNotificationJob Deleting "
          + "NotificationJob with ID:", notification_job._id,
          error)
      } else {
        console.log("<SUCCESS> scheduleNotificationJob "
          + "Deleting NotificationJob")
      }
    });
  });
  return job
}

async function updateNotificationJobGlobalIndex(
  notification_job_id, global_index) {
  try {
    const update_promise = new Promise((resolve, reject) => {
      NotificationJob.findByIdAndUpdate(notification_job_id,
        {global_index: global_index},
        {new: true},
        (error, notification_job) => {
          if(error) {
            console.log(`<ERROR> updateNotificationJobGlobalIndex`
              + ` updating notification job with id ${notification_job_id}`
              + ` and global_index ${global_index}`, error)
            reject(null)
          } else if(notification_job == null) {
            console.log(`<ERROR> updateNotificationJobGlobalIndex`
              + ` notification_job job with id ${notification_job_id}`
              + ` not found`)
            reject(null)
          } else {
            resolve(notification_job)
          }
        }
      )
    })
    const updated_notification_job = await Promise.resolve(
      update_promise)
    return updated_notification_job
  } catch(error) {
    console.log(`<ERROR> updateNotificationJobGlobalIndex`
      + ` notification_job_id ${notification_job_id} global_index`
      + ` ${global_index}`, error)
    return null
  }
}