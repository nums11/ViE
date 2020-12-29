const express = require('express');
const notificationRoutes = express.Router();
const schedule = require('node-schedule');
const User = require('../User/User.model');
const NotificationJob = require('./NotificationJob.model');

notificationRoutes.post('/schedule_show_qr/:primary_instructor_id/:secondary_instructor_id/:meeting_id',
  async (req, res) => {
  let primary_instructor_id = req.params.primary_instructor_id
  let secondary_instructor_id = req.params.secondary_instructor_id
  let meeting_id = req.params.meeting_id
  let qr_scan_start_time = new Date(req.body.qr_scan_start_time)

  const notification_job = new NotificationJob({
    scheduled_time: qr_scan_start_time,
    primary_instructor_id: primary_instructor_id,
    secondary_instructor_id: secondary_instructor_id,
    meeting_id: meeting_id
  })
  const saved_notification_job = await notification_job.save()

  let job = schedule.scheduleJob(qr_scan_start_time, function(){
    saved_notification_job.sendScheduledShowQRNotificationsToInstructors()
    NotificationJob.findByIdAndRemove(saved_notification_job._id, (error) => {
      if (error) {
        console.log("<ERROR> (notifications/schedule_show_qr) Deleting NotificationJob with ID:",
          saved_notification_job._id, error)
      } else {
        console.log("<SUCCESS> (notifications/schedule_show_qr) Deleting NotificationJob")
      }
    });
  });

  all_notification_jobs.push(job)
  let global_index = all_notification_jobs.length - 1
  NotificationJob.findByIdAndUpdate(saved_notification_job._id,
    {global_index: global_index},
    (error, notification_job) => {
      if(error || notification_job == null) {
        console.log("<ERROR> (notifications/schedule_show_qr) Updating NotificationJob with ID:",
          saved_notification_job._id, error)
        res.status(500).json(error)
      } else {
        console.log("<SUCCESS> (notifications/schedule_show_qr) Updating NotificationJob with"
          + " global_index")
        res.json(notification_job)
      }
    }
  )
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

// notificationRoutes.post('/notify_all', (req, res) => {
//   const payload = JSON.stringify({ title: "Notification from Venue" });
//   User.find(async (error, users) => {
//     if(error || users == null) {
//       console.log("<ERROR> (notifications/notify_all) Notifying all users", error)
//       res.json(error);
//     } else {
//       let notification_promises = []
//       users.forEach(user => {
//         user.service_worker_subscriptions.forEach(subscription => {
//           notification_promises.push(new Promise((resolve, reject) => {
//             webpush
//               .sendNotification(subscription, payload)
//               .then(notification => resolve(notification))
//               .catch(error => {
//                 console.log("<ERROR> (notifications/notify_all) sending notification with subscription",
//                   subscription, error)
//                 resolve({})
//               });
//           }))
//         })
//       })
//       try {
//         const notifications = await Promise.all(notification_promises)
//         console.log("<SUCCESS> (notifications/notify_all) Notifying all users")
//         res.json(notifications)
//       } catch(error) {
//         console.log("<ERROR> (notifications/notify_all) Notifying all users", error)
//         res.json(error)
//       }
//     }
//   })
// });

module.exports = notificationRoutes;
