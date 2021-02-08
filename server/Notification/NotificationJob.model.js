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
	instructor_ids: [{
		type: String,
	}],
	meeting_id: {
		type: String,
		required: true
	},
	qr_scan_id: {
		type: String,
		required: true
	}
});

NotificationJob.methods.
	sendScheduledShowQRNotificationsToInstructors = 
	async function() {
	  const redirect_url = process.env.NODE_ENV === "production" ?
	  `https://viengage.com/#/meeting_info/`
	  + `${this.meeting_id}/${this.qr_scan_id}` :
	  `http://localhost:8080/#/meeting_info/`
	  + `${this.meeting_id}/${this.qr_scan_id}`
	  const payload = JSON.stringify({
	    title: "ViE - It's time to show your QR Code!",
	    redirect_url: redirect_url
	  });

	  try {
	  	const notification_promises = []
	  	this.instructor_ids.forEach(instructor_id => {
	  		notification_promises.push(new Promise(
	  			async (resolve, reject) => {
	  			try {
		  			const stale_subscriptions =
		  				await sendNotificationToUser(instructor_id, payload)
		  			if(stale_subscriptions == null) {
		  				console.log("<ERROR> "
		  					+ "sendScheduledShowQRNotificationsToInstructors "
		  					+ "sending notification")
		  				reject(null)
		  			}
		  			resolve(stale_subscriptions)
		  		} catch(error) {
		  			console.log("<ERROR> sendScheduledShowQRNotificationsToInstructors"
		  				+ " sending notifications", error)
		  			reject(null)
		  		}
	  		}))
	  	})
	  	const stale_instructor_subscriptions
	  		= await Promise.all(notification_promises)
	  	for(let i = 0; i < stale_instructor_subscriptions.length; i++) {
	  		const stale_subscriptions = stale_instructor_subscriptions[i]
	  		if(stale_subscriptions.length > 0) {
		  		removeStaleSubscriptionsFromUser(this.instructor_ids[i],
		  			stale_subscriptions)
		  	}
	  	}
	  } catch(error) {
	  	console.log("<ERROR> sendScheduledShowQRNotificationsToInstructors",
	  		error)
	  }
}

async function sendNotificationToUser(user_id, payload) {
	try {
	  const notification_send_promise = new Promise(
	  	(resolve, reject) => {
		  User.findById(user_id,
		  	async (error, user) => {
		    if(error) {
		    	console.log(`<ERROR> sendNotificationToUser finding user with id`
		    		+ `user_id`, error)
		    	reject(null)
		    } else if(user == null) {
		      console.log(`<ERROR> sendNotificationToUser user with  id`
		      	+ ` ${user_id} not found`)
		      reject(null)
		    } else {
		    	try {
	 					const notification_promises = []
			      user.service_worker_subscriptions.forEach(subscription => {
			        notification_promises.push(new Promise((resolve, reject) => {
			          webpush
			            .sendNotification(subscription, payload)
			            .then(notification => {
			              console.log("SUCCESSFULY SENT NOTIFICATION")
			              resolve(true)
			            })
			            .catch(error => {
			              console.log("STALE SUBSCRIPTION")
			              reject(subscription)
			            });
			        }))
			      })
			      const statuses = await Promise.allSettled(notification_promises)
			      const stale_subscriptions = []
			      statuses.forEach(status => {
			      	if(status.status === "rejected")
			      		stale_subscriptions.push(status.value)
			      })
			      resolve(stale_subscriptions)
			    } catch(error) {
			    	console.log("<ERROR> sendNotificationToUser sending notifcations",
			    		error)
			    	reject(null)
			    }
		    }
		  })
		})
		const stale_subscriptions = await Promise.resolve(
			notification_send_promise)
		return stale_subscriptions
	} catch(error) {
		console.log(`<ERROR> sendNotificationToUser user_id ${user_id}`
			+ ` payload`, payload, error)
		return null
	}
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