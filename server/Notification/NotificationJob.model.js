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
	  let instructor_notification_promises = await sendNotificationToUser(this.primary_instructor_id,
	  	payload, route)
	  let secondary_instructor_notification_promises = []
	  if(this.secondary_instructor_id !== "null"){
	    secondary_instructor_notification_promises =
	      await sendNotificationToUser(this.secondary_instructor_id, payload, route)
	  }

	  try {
	    const primary_instructor_subscriptions = await Promise.all(instructor_notification_promises)
	    const secondary_instructor_subscriptions = await Promise.all(secondary_instructor_notification_promises)
	    const stale_primary_instructor_subscriptions = removeUndefinedValues(primary_instructor_subscriptions)
	    const stale_secondary_instructor_subscriptions = removeUndefinedValues(secondary_instructor_subscriptions)
	    if(stale_primary_instructor_subscriptions.length > 0) {
	    	removeStaleSubscriptionsFromUser(this.primary_instructor_id,
	    		stale_primary_instructor_subscriptions)
	    }
	    if(stale_secondary_instructor_subscriptions.length > 0) {
	    	removeStaleSubscriptionsFromUser(this.secondary_instructor_id,
	    		stale_secondary_instructor_subscriptions)
	    }
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
              resolve()
            })
            .catch(error => {
              console.log("STALE SUBSCRIPTION")
              resolve(subscription)
            });
        }))
      })
    }
  })
  return notification_promises
}

function removeUndefinedValues(array) {
	return array.filter((el) => {
	  return el != null;
	});
}

function removeStaleSubscriptionsFromUser(user_id, stale_subscriptions) {
	let stale_subscription_endpoints = getSubscriptionEndpoints(stale_subscriptions)
	User.findByIdAndUpdate(user_id,
		{$pull: {service_worker_subscriptions: {"endpoint": {$in: stale_subscription_endpoints}}}},
		(error, user) => {
			if(error || user == null) {
				console.log("<ERROR> (removeStaleSubscriptionsFromUser) removing stale_subscriptions",
					stale_subscriptions,"from user id", user_id, error)
			} else {
				console.log("SUCCESSFULLY REMVOVED STALE SUBSCRIPTIONS")
			}
		})
}

function getSubscriptionEndpoints(subscriptions) {
	let endpoints = []
	subscriptions.forEach(subscription => {
		endpoints.push(subscription.endpoint)
	})
	return endpoints
}

module.exports = mongoose.model('NotificationJob', NotificationJob);