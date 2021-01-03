const express = require('express');
const notificationRoutes = express.Router();
const schedule = require('node-schedule');
const User = require('../User/User.model');
const NotificationJob = require('./NotificationJob.model');

notificationRoutes.post(
  '/schedule_show_qr/:primary_instructor_id/:secondary_instructor_id/:meeting_id',
  async (req, res, next) => {
  const primary_instructor_id = req.params.primary_instructor_id
  const secondary_instructor_id = req.params.secondary_instructor_id
  const meeting_id = req.params.meeting_id
  const scheduled_qr_times = req.body.scheduled_qr_times

  try {
    let schedule_promises = []
    scheduled_qr_times.forEach(scheduled_time => {
      schedule_promises.push(new Promise(async (resolve, reject) => {
        const updated_notification_job = await scheduleShowQRNotification(
          scheduled_time, primary_instructor_id, meeting_id)
        if(updated_notification_job == null)
          reject(null)
        else
          resolve(updated_notification_job)
      }))
    })
    const updated_notification_jobs = await Promise.all(schedule_promises)
    console.log("<SUCCESS> (notifications/schedule_show_qr)")
    res.json(updated_notification_jobs)
  } catch(error) {
    next(error)
  }

})

notificationRoutes.get('/', (req, res) => {
  NotificationJob.find(function(err, notification_jobs){
    if(err || notification_jobs == null) {
      console.log("<ERROR> (notifications/) Getting all notification_jobs", err)
      res.status(500).json(err);
    } else {
      console.log("<SUCCESS> (notifications/) Getting all notification jobs")
      res.json(notification_jobs);
    }
  })
})

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

module.exports = notificationRoutes;
