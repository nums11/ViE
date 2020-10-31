const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../User/User.model');
const webpush = require("web-push");
const publicVapidKey = "BG5zFCphvwcm3WYs3N5d41jO85PcvpJkEYPlz9j3OjVdzI_XX0KPw_U8V5aEmaOBHXIymaGcCWyOAH-TmoobXKA"
const privateVapidKey = "Zu01PHDOctOOBOt2QqjcwWwQg0v5xMSR7QZ-w_a7Pm0"

webpush.setVapidDetails(
  "mailto:numsmt2@gmail.com",
  publicVapidKey,
  privateVapidKey
);

//Define collection and schema for NotificationJob
let NotificationJob = new Schema({
	global_index: {
		type: Number
	},
	scheduled_time: {
		type: Date,
		required: true
	},
	primary_instructor_id: {
		type: String,
		required: true
	},
	secondary_instructor_id: {
		type: String,
		required: true
	},
	meeting_id: {
		type: String,
		required: true
	}
});

NotificationJob.methods.sendScheduledShowQRNotificationsToInstructors = 
	async function() {
	  const redirect_url = process.env.NODE_ENV === "production" ?
	  `https://byakugan.herokuapp.com/#/meeting_info/${this.meeting_id}` :
	  `http://localhost:8080/#/meeting_info/${this.meeting_id}`
	  const payload = JSON.stringify({
	    title: "Venue - It's time to show your QR Code!",
	    redirect_url: redirect_url
	  });
	  const route = "notifications/schedule_show_qr"
	  let notification_promises = []
	  let instructor_notification_promises = await sendNotificationToUser(this.primary_instructor_id,
	  	payload, route)
	  notification_promises =  notification_promises.concat(instructor_notification_promises)
	  if(this.secondary_instructor_id !== "null"){
	    let secondary_instructor_notification_promises =
	      await sendNotificationToUser(this.secondary_instructor_id, payload, route)
	    notification_promises = notification_promises.concat(secondary_instructor_notification_promises)
	  }

	  try {
	    const notifications = await Promise.all(notification_promises)
	    console.log(`<SUCCESS> (${route}) sending notifications to instructor(s)`)
	  } catch (error) {
	    console.log(`<ERROR> (${route}) awaiting notifications to be sent to instructor(s)`,
	      this.primary_instructor_id, this.secondary_instructor_id, error)
	  }
}

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

module.exports = mongoose.model('NotificationJob', NotificationJob);