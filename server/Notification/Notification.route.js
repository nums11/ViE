const express = require('express');
const notificationRoutes = express.Router();
const webpush = require("web-push");
const publicVapidKey = "BG5zFCphvwcm3WYs3N5d41jO85PcvpJkEYPlz9j3OjVdzI_XX0KPw_U8V5aEmaOBHXIymaGcCWyOAH-TmoobXKA"
const privateVapidKey = "Zu01PHDOctOOBOt2QqjcwWwQg0v5xMSR7QZ-w_a7Pm0"

let User = require('../User/User.model');

webpush.setVapidDetails(
  "mailto:numsmt2@gmail.com",
  publicVapidKey,
  privateVapidKey
);

notificationRoutes.post('/send', function (req, res) {
  console.log("In API Call")
  // Get pushSubscription object
  const subscription = req.body.subscription;
  console.log("Received subscription", subscription)

  // Send 201 - resource created
  res.status(201).json({});

  // Create payload
  const payload = JSON.stringify({ title: "Venue - QR Code is ready to be shown" });

  // Pass object into sendNotification
  // webpush
  //   .sendNotification(subscription, payload)
  //   .then(() => {console.log("Sent notification successfully")})
  //   .catch(err => console.log("Error sending webpush notification", err));
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
        console.log("In success block")
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
