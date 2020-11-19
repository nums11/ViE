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
let is_monday_meeting = true

module.exports = {clearAllModels, createInstructor, createStudents,
createCourse, createMeetingsForCourse, populateModels, clearSeedModels};

async function clearAllModels() {
	let clear_promise = new Promise((resolve, reject) => {
		seeder.connect(process.env.MONGODB_URI || DB.DB_URL,
			loadAndClearModels.bind(this,resolve,reject))
	})
	try {
		await Promise.resolve(clear_promise)
	} catch(error) {
		console.log("Error clearing models")
	}
}

async function createInstructor(is_admin, SeedModels) {
	if(is_admin) {
		SeedModels.instructors.push(new User({
			first_name: "Numfor",
			last_name: "Mbiziwo-Tiapo",
			user_id: "mbizin",
			email: "venue@rpi.edu",
			password: "nimda",
			is_instructor: true,
			is_admin: true,
			instructor_courses: [],
			student_courses: [],
			users_orgs: [],
			meetings: [],
			live_submissions: [],
			async_submissions: [],
			service_worker_subscriptions: []
		}))
	} else {
		let num_instructors = SeedModels.instructors.length
		SeedModels.instructors.push(new User({
			first_name: "Inst",
			last_name: `${num_instructors + 1}`,
			user_id: `inst${num_instructors + 1}`,
			email: `inst${num_instructors + 1}@rpi.edu`,
			password: "password",
			is_instructor: true,
			is_admin: false,
			instructor_courses: [],
			student_courses: [],
			users_orgs: [],
			meetings: [],
			live_submissions: [],
			async_submissions: [],
			service_worker_subscriptions: []
		}))
	}
	await hashPasswordsForUsers(true, SeedModels)
}

async function createStudents(num_students, SeedModels) {
	for(let i=0;i<num_students;i++) { //a-p 
		SeedModels.students.push(new User({
			first_name: "Student",
			last_name: `${i + 1}`,
			user_id: `student${i + 1}`,
			email: `student${i + 1}@rpi.edu`,
			password: "password",
			is_instructor: false,
			is_admin: false,
			instructor_courses: [],
			student_courses: [],
			users_orgs: [],
			meetings: [],
			live_submissions: [],
			async_submissions: [],
		}))
	}
	await hashPasswordsForUsers(false, SeedModels)
}

function createCourse(name, dept, course_number,
	instructor, secondary_instructor, students,
	SeedModels) {
	let course = new Course({ // 0
		name: name,
		dept: dept,
		course_number: course_number,
		instructor: instructor,
		secondary_instructor: secondary_instructor,
		students: students,
		meetings: []
	})
	SeedModels.courses.push(course)
	instructor.instructor_courses.push(course._id)
	if(secondary_instructor != null)
		secondary_instructor.instructor_courses.push(course._id)
	SeedModels.students.forEach(
		student => student.student_courses.push(course._id))
}

/* Creates meetings of different types for course
 Type 1 - live only
 Type 2 - async only
 Type 3 - both
*/
function createMeetingsForCourse(num_meetings, course,
	seed_size, SeedModels) {
	let num_live_submissions = 0, num_async_submissions = 0
	if(seed_size === "small") {
		num_live_submissions = 10
		num_async_submissions = 5
	} else if(seed_size === "medium") {
		num_live_submissions = 40
		num_async_submissions = 25
	} else if(seed_size === "large") {
		num_live_submissions = 100
		num_async_submissions = 80
	}
	for(let i=1; i <= num_meetings; i++) {
		let meeting_type = (i + 3) % 3
		if(meeting_type === 1) {
			createMeeting(course,
				true, num_live_submissions, false, 0, SeedModels)
		} else if(meeting_type === 2) {
			createMeeting(course,
				false, 0, true, num_async_submissions, SeedModels)
		} else {
			createMeeting(course,
				true, num_live_submissions, true, num_async_submissions,
				SeedModels)
		}
	}
}

function createMeeting(course, has_live_attendance, num_live_submissions,
	has_async_attendance, num_async_submissions, SeedModels) {
	let meeting_start = null, meeting_end = null
	let only_async_meeting = has_async_attendance && !has_live_attendance
	if(!only_async_meeting){
		let meeting_times = getPastMeetingTimes(is_monday_meeting)
		meeting_start = meeting_times.meeting_start
		meeting_end = meeting_times.meeting_end
		is_monday_meeting = !is_monday_meeting
	}

	let live_attendance = new LiveAttendance({
		qr_checkins: []
	})
	let async_attendance = new AsyncAttendance({
		recordings: []
	})
	let meeting = new Meeting({
		title: `Meeting ${SeedModels.meetings.length + 1}`,
		start_time: meeting_start,
		end_time: meeting_end,
		for_course: true,
		course: course._id,
		has_live_attendance: has_live_attendance,
		has_async_attendance: has_async_attendance,
		live_attendance: live_attendance,
		async_attendance: async_attendance
	})

	if(has_live_attendance) {
		generateQRCheckin(meeting, course.students, num_live_submissions,
		 SeedModels)
	}
	if(has_async_attendance) {
		generateRecording(meeting, course.students, num_async_submissions,
			only_async_meeting, SeedModels)
	}

	// Update the course, instructor, and students
	course.meetings.push(meeting)
	course.instructor.meetings.push(meeting)
	if(course.secondary_instructor !== null)
		course.secondary_instructor.meetings.push(meeting)
	course.students.forEach(student => student.meetings.push(meeting))

	SeedModels.live_attendances.push(meeting.live_attendance)
	SeedModels.async_attendances.push(meeting.async_attendance)
	SeedModels.meetings.push(meeting)
}

function generateQRCheckin(meeting, course_students, num_live_submissions,
	SeedModels) {
	let qr_checkin = new QRCheckin({
		code: generateRandomCode(),
		qr_checkin_start_time: meeting.start_time,
		qr_checkin_end_time: addFiveMinutes(meeting.start_time),
		qr_checkin_submissions: []
	})

	let qr_checkin_submissions = []
	let submission_ids = Array.from(getRandomIDsFromArray(
		course_students, num_live_submissions))
	for(let i = 0; i < num_live_submissions; i++) {
		qr_checkin_submissions.push(new LiveSubmission({
			submitter: submission_ids[i],
			live_submission_time: getRandomTimeBetweenTwoTimes(
														qr_checkin.qr_checkin_start_time,
														qr_checkin.qr_checkin_end_time),
			is_qr_checkin_submission: true,
			qr_checkin: qr_checkin._id,
		}))
	}
	qr_checkin.qr_checkin_submissions = qr_checkin_submissions
	meeting.live_attendance.qr_checkins = qr_checkin

	SeedModels.qr_checkins.push(qr_checkin)
	SeedModels.live_submissions =
		SeedModels.live_submissions.concat(qr_checkin_submissions)
}

function generateRecording(meeting, course_students, num_async_submissions,
	only_async_meeting, SeedModels) {
	let recording_submission_start = null,
			recording_submission_end = null
	// Use the meeting times if possible otherwise generate times for the recording
	if(only_async_meeting) {
		let meeting_times = getPastMeetingTimes(is_monday_meeting)
		recording_submission_start = meeting_times.meeting_start
		recording_submission_end = meeting_times.meeting_end
		is_monday_meeting = !is_monday_meeting
	} else {
		recording_submission_start = meeting.start_time
		recording_submission_end = meeting.end_time
	}
	let recording = new Recording({
		video_url: "https://storage.googleapis.com/venue_videos/sample1.mp4",
		recording_submission_start_time: recording_submission_start,
		recording_submission_end_time: recording_submission_end,
		recording_submissions: []
	})

	let recording_submissions = []
	let submission_ids = Array.from(getRandomIDsFromArray(
		course_students, num_async_submissions))
	for(let i = 0; i < num_async_submissions; i++) {
		// Length of sample1.mp4 is 13 seconds
		let video_length = 13
		let furthest_video_time = getRandomInt(0,video_length)
		recording_submissions.push(new AsyncSubmission({
			submitter: submission_ids[i],
			is_recording: true,
			recording: recording._id,
			furthest_video_time: furthest_video_time,
			video_percent_watched: (furthest_video_time/13)*100
		}))
	}
	recording.recording_submissions = recording_submissions
	meeting.async_attendance.recordings = recording

	SeedModels.recordings.push(recording)
	SeedModels.async_submissions =
		SeedModels.async_submissions.concat(recording_submissions)
}

async function hashPasswordsForUsers(is_instructor, SeedModels) {
	let users = is_instructor ? SeedModels.instructors :
															SeedModels.students
	let password_promises = []
	users.forEach(user => {
		password_promises.push(new Promise((resolve, reject) => {
			bcrypt.hash(user.password,saltRounds,(err,hashed_password) => {
				user.password = hashed_password
				resolve(hashed_password)
			})
		}))
	})
	try {
		await Promise.all(password_promises)
	} catch(error) {
		console.log("Error resolving passwords")
	}
}

async function populateModels(SeedModels) {
	let seed_data = getSeedData(SeedModels)
	let populate_promise = new Promise((resolve, reject) => {
		seeder.connect(process.env.MONGODB_URI || DB.DB_URL,
			loadAndPopulateModels.bind(this, seed_data, resolve, reject))
	})
	try {
		await Promise.resolve(populate_promise)
	} catch(error) {
		console.log("Error populating models")
	}
}

function loadAndPopulateModels(seed_data, resolve, reject) {
	loadModels()
	seeder.populateModels(seed_data, function (err, done) {
		if (err) {
			console.log("<ERROR> Populating Models.", err)
		} else if (done) {
			console.log("<SUCCESS> Seed Completed", done)
		}
		seeder.disconnect()
		resolve(true)
	})
}

function loadAndClearModels(resolve, reject) {
	loadModels()
	seeder.clearModels(['Course', 'User', 'Organization', 'Meeting',
		'LiveAttendance', 'AsyncAttendance', 'LiveSubmission', 'AsyncSubmission',
		'QRCheckin', 'Recording', 'Poll', 'NotificationJob'], function () {
			seeder.disconnect()
			resolve(true)
	})
}

function loadModels() {
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
}

function clearSeedModels(SeedModels) {
	for([key,value] of Object.entries(SeedModels)) {
		SeedModels[key] =[]
	}
}

function getSeedData(SeedModels) {
	return [
		{
			'model': 'User',
			'documents': SeedModels.instructors.
										concat(SeedModels.students),
		},
		{
			'model': 'Course',
			'documents': SeedModels.courses
		},
		{
			'model': 'Meeting',
			'documents': SeedModels.meetings
		},
		{
			'model': 'LiveAttendance',
			'documents': SeedModels.live_attendances
		},
		{
			'model': 'AsyncAttendance',
			'documents': SeedModels.async_attendances
		},
		{
			'model': 'QRCheckin',
			'documents': SeedModels.qr_checkins
		},
		{
			'model': 'Recording',
			'documents': SeedModels.recordings
		},
		{
			'model': 'LiveSubmission',
			'documents': SeedModels.live_submissions
		},
		{
			'model': 'AsyncSubmission',
			'documents': SeedModels.async_submissions
		}
	]
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

