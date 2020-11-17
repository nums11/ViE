const seeder = require("mongoose-seed");
const moment = require('moment')
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

module.exports = {
	models: {User, Course, Meeting, LiveAttendance, AsyncAttendance,
						Recording, QRCheckin, LiveSubmission, AsyncSubmission,
						clearAllModels},
	functions: {clearAllModels, getObjectIDsFromArray,
							getPastMeetingTimes, generateRandomCode,
							addFiveMinutes, getRandomTimeBetweenTwoTimes,
							getRandomIDsFromArray, getRandomInt} 
};

function clearAllModels() {
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

function getObjectIDsFromArray(arr) {
	let object_ids = []
	arr.forEach(elem => {
		object_ids.push(elem._id)
	})
	return object_ids
}

function getRandomIDsFromArray(arr, num_rand_ids) {
	let rand_ids = new Set()
	while(num_rand_ids > 0) {
		let rand_index = getRandomInt(0, arr.length-1)
		let rand_id = arr[rand_index]._id
		if(!rand_ids.has(rand_id)){
			rand_ids.add(rand_id)
			num_rand_ids--
		}
	}
	return rand_ids
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Returns 2 hr long meeting times from either last Monday or last Thursday
function getPastMeetingTimes(is_monday_meeting) {
	let day_index = is_monday_meeting ? 1 : 4
	let meeting_start = moment().day(day_index-7)
	let meeting_end = moment(meeting_start).add(2, 'h')
	return {meeting_start, meeting_end}
}

function generateRandomCode() {
  const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 100; i > 0; --i) {
    result += alnums[Math.floor(Math.random() * alnums.length)];
  }
  return result;
}

function addFiveMinutes(date) {
	return moment(date).add(5,'m')
}

function getRandomTimeBetweenTwoTimes(start, end) {
	let random_time = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
	return random_time
}

