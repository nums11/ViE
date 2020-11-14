const seeder = require("mongoose-seed");
const Course = require("../Course/Course.model")
const Organization = require("../Organization/Organization.model")
const LiveAttendance = require("../LiveAttendance/LiveAttendance.model")
const AsyncAttendance = require("../AsyncAttendance/AsyncAttendance.model")
const LiveSubmission = require("../LiveSubmission/LiveSubmission.model")
const AsyncSubmission = require("../AsyncSubmission/AsyncSubmission.model")
const QRCheckin = require("../QRCheckin/QRCheckin.model")
const Recording = require("../Recording/Recording.model")
const User = require("../User/User.model")
const Poll = require("../Poll/Poll.model")
const Meeting = require("../Meeting/Meeting.model")
const NotificationJob = require("../Notification/NotificationJob.model")
const DB = require('../DB.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const clearAllModels = function() {
	seeder.connect(process.env.MONGODB_URI || DB.DB_URL, function () {
		// seeder loads from the server folder
		seeder.loadModels([
			"Course/Course.model",
			"User/User.model",
			"Poll/Poll.model",
			"Organization/Organization.model",
			"Meeting/Meeting.model",
			"LiveAttendance/LiveAttendance.model",
			"AsyncAttendance/AsyncAttendance.model",
			"LiveSubmission/LiveSubmission.model",
			"AsyncSubmission/AsyncSubmission.model",
			"QRCheckin/QRCheckin.model",
			"Recording/Recording.model",
			"Notification/NotificationJob.model"
		]);
		seeder.clearModels(['Course', 'User', 'Organization', 'Meeting',
			'LiveAttendance', 'AsyncAttendance', 'LiveSubmission', 'AsyncSubmission',
			'QRCheckin', 'Recording', 'Poll', 'NotificationJob'], function () {
				seeder.disconnect()
			})
	})
}

const getObjectIDsFromArray = function(arr, start, end) {
	let object_ids = []
	for(let i = start; i < end; i++) {
		object_ids.push(arr[i]._id)
	}
	return object_ids
}

// Returns 2 hr long meeting times from last week's Monday
const getPreviousMondayMeetingTimes = function() {
	let prev_monday = new Date();
	prev_monday.setDate(prev_monday.getDate() - (prev_monday.getDay() + 6) % 7);
	let meeting_start = prev_monday
	let meeting_end = new Date(meeting_start.getTime() + (2*60*60*1000))
	return {meeting_start, meeting_end}
}

const generateRandomCode = function() {
  const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 100; i > 0; --i) {
    result += alnums[Math.floor(Math.random() * alnums.length)];
  }
  return result;
}

module.exports = {
	models: {User, Course, Meeting, LiveAttendance, AsyncAttendance,
						Recording, QRCheckin, LiveSubmission, AsyncSubmission,
						clearAllModels},
	functions: {clearAllModels, getObjectIDsFromArray,
							getPreviousMondayMeetingTimes, generateRandomCode} 
};

