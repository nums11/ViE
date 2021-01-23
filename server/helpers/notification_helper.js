const NotificationJob = require('../Notification/NotificationJob.model');
const schedule = require('node-schedule');

module.exports = {scheduleShowQRNotification}

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