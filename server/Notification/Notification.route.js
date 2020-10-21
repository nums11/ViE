const express = require('express');
const notificationRoutes = express.Router();
const webpush = require("web-push");
const publicVapidKey = "BG5zFCphvwcm3WYs3N5d41jO85PcvpJkEYPlz9j3OjVdzI_XX0KPw_U8V5aEmaOBHXIymaGcCWyOAH-TmoobXKA"
const privateVapidKey = "Zu01PHDOctOOBOt2QqjcwWwQg0v5xMSR7QZ-w_a7Pm0"
const schedule = require('node-schedule');

let User = require('../User/User.model');

webpush.setVapidDetails(
  "mailto:numsmt2@gmail.com",
  publicVapidKey,
  privateVapidKey
);

const sendNotificationToUser = async (user_id, payload, route) => {
  let notification_promises = []
  await User.findById(user_id, (error, user) => {
    if(error || user == null) {
      console.log(`<ERROR> (${route}) Finding user by id`,
        user_id, error)
    } else {
      user.service_worker_subscriptions.forEach(subscription => {
        notification_promises.push(new Promise((resolve, reject) => {
          webpush
            .sendNotification(subscription, payload)
            .then(notification => {
              console.log("SUCCESSFULY SENT NOTIFICATION")
              resolve(notification)
            })
            .catch(error => {
              console.log(`<ERROR> (${route}) sending notification with subscription`,
                subscription, error)
              resolve({})
            });
        }))
      })
    }
  })
  return notification_promises
}

const sendScheduledShowQRNotificationsToInstructors = async (primary_instructor_id,
  secondary_instructor_id, meeting_id) => {
  const redirect_url = process.env.NODE_ENV === "production" ?
  `https://byakugan.herokuapp.com/#/meeting_info/${meeting_id}` :
  `http://localhost:8080/#/meeting_info/${meeting_id}`
  console.log("Meeting Info url", redirect_url)
  const payload = JSON.stringify({
    title: "Venue - It's time to show your QR Code!",
    redirect_url: redirect_url
  });
  const route = "notifications/schedule_show_qr"
  let notification_promises = []
  let instructor_notification_promises = await sendNotificationToUser(primary_instructor_id, payload, route)
  notification_promises =  notification_promises.concat(instructor_notification_promises)
  if(secondary_instructor_id !== "null"){
    let secondary_instructor_notification_promises =
      await sendNotificationToUser(secondary_instructor_id, payload, route)
    notification_promises = notification_promises.concat(secondary_instructor_notification_promises)
  }

  try {
    const notifications = await Promise.all(notification_promises)
    console.log(`<SUCCESS> (${route}) sending notifications to instructor(s)`)
  } catch (error) {
    console.log(`<ERROR> (${route}) awaiting notifications to be sent to instructor(s)`,
      primary_instructor_id, secondary_instructor_id, error)
  }
}

notificationRoutes.post('/schedule_show_qr/:primary_instructor_id/:secondary_instructor_id/:meeting_id',
  (req, res) => {
  let primary_instructor_id = req.params.primary_instructor_id
  let secondary_instructor_id = req.params.secondary_instructor_id
  let meeting_id = req.params.meeting_id
  let qr_checkin_start_time = new Date(req.body.qr_checkin_start_time)
  console.log("QR checkin start time", qr_checkin_start_time)

  let job = schedule.scheduleJob(qr_checkin_start_time, function(){
    sendScheduledShowQRNotificationsToInstructors(primary_instructor_id,
      secondary_instructor_id, meeting_id)
  });
  console.log("scheduled job", job)
  res.json({})
})

notificationRoutes.post('/show_qr/:primary_instructor_id/:secondary_instructor_id/:meeting_id',
  async (req, res) => {
  let primary_instructor_id = req.params.primary_instructor_id
  let secondary_instructor_id = req.params.secondary_instructor_id
  let meeting_id = req.params.meeting_id
  console.log("Meeting id", meeting_id)
  const redirect_url = process.env.NODE_ENV === "production" ?
  `https://byakugan.herokuapp.com/#/meeting_info/${meeting_id}` :
  `http://localhost:8080/#/meeting_info/${meeting_id}`
  console.log("Meeting Info url", redirect_url)

  const payload = JSON.stringify({
    title: "Venue - It's time to show your QR Code!",
    redirect_url: redirect_url
  });
  const route = "notifications/show_qr"
  let notification_promises = []
  let instructor_notification_promises = await sendNotificationToUser(primary_instructor_id, payload, route)
  notification_promises =  notification_promises.concat(instructor_notification_promises)
  if(secondary_instructor_id !== "null"){
    let secondary_instructor_notification_promises =
      await sendNotificationToUser(secondary_instructor_id, payload, route)
    notification_promises = notification_promises.concat(secondary_instructor_notification_promises)
  }

  try {
    const notifications = await Promise.all(notification_promises)
    console.log(`<SUCCESS> (${route}) sending notifications to instructor(s)`)
    res.json(notifications)
  } catch (error) {
    console.log(`<ERROR> (${route}) awaiting notifications to be sent to instructor(s)`,
      primary_instructor_id, secondary_instructor_id, error)
    res.json(error)
  }
});

notificationRoutes.post('/notify_all', (req, res) => {
  const payload = JSON.stringify({ title: "Notification from Venue" });
  User.find(async (error, users) => {
    if(error || users == null) {
      console.log("<ERROR> (notifications/notify_all) Notifying all users", error)
      res.json(error);
    } else {
      let notification_promises = []
      users.forEach(user => {
        user.service_worker_subscriptions.forEach(subscription => {
          notification_promises.push(new Promise((resolve, reject) => {
            webpush
              .sendNotification(subscription, payload)
              .then(notification => resolve(notification))
              .catch(error => {
                console.log("<ERROR> (notifications/notify_all) sending notification with subscription",
                  subscription, error)
                resolve({})
              });
          }))
        })
      })
      try {
        const notifications = await Promise.all(notification_promises)
        console.log("<SUCCESS> (notifications/notify_all) Notifying all users")
        res.json(notifications)
      } catch(error) {
        console.log("<ERROR> (notifications/notify_all) Notifying all users", error)
        res.json(error)
      }
    }
  })
});

module.exports = notificationRoutes;
