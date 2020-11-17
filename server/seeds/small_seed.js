/*
Seeds database with these parameters
- 1 Instructor
- 16 Students
- 1 Course
- 3 Meetings for the course
	- 1 with only live attendance
	- 1 with only async attendance
	- 1 with both live and async attendance
*/

const SeedHelper = require('./seed_helper')

let instructors = [], students = [], courses = [],
		meetings = [], live_attendances = [],
		async_attendances = [],
		qr_checkins = [], recordings = [],
		live_submissions = [], async_submissions = [],
		is_monday_meeting = true

SeedHelper.functions.clearAllModels()
createInstructor()
createStudents()
createCourse("RCOS", "CSCI", 2961, instructors[0],students)
createMeeting(courses[0], true, 9, false, 0)
createMeeting(courses[0], false, 0, true, 5)
createMeeting(courses[0], true, 10, true, 5)

function createInstructor() {
	instructors.push(new SeedHelper.models.User({
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
}

function createStudents() {
	for(let i=0;i<16;i++) { //a-p 
		students.push(new SeedHelper.models.User({
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
}

function createCourse(name, dept, course_number, instructor, students) {
	let course = new SeedHelper.models.Course({ // 0
		name: name,
		dept: dept,
		course_number: course_number,
		instructor: instructor,
		students: students,
		meetings: []
	})
	courses.push(course)
	instructor.instructor_courses.push(course._id)
	students.forEach(student => student.student_courses.push(course._id))
}

function createMeeting(course, has_live_attendance, num_live_submissions,
	has_async_attendance, num_async_submissions) {
	let meeting_start = null, meeting_end = null
	let only_async_meeting = has_async_attendance && !has_live_attendance
	if(!only_async_meeting){
		let meeting_times = SeedHelper.functions.getPastMeetingTimes(is_monday_meeting)
		meeting_start = meeting_times.meeting_start
		meeting_end = meeting_times.meeting_end
		is_monday_meeting = !is_monday_meeting
	}

	let live_attendance = new SeedHelper.models.LiveAttendance({
		qr_checkins: []
	})
	let async_attendance = new SeedHelper.models.AsyncAttendance({
		recordings: []
	})
	let meeting = new SeedHelper.models.Meeting({
		title: `Meeting ${meetings.length + 1}`,
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
		let qr_checkin = new SeedHelper.models.QRCheckin({
			code: SeedHelper.functions.generateRandomCode(),
			qr_checkin_start_time: meeting_start,
			qr_checkin_end_time: SeedHelper.functions.addFiveMinutes(meeting_start),
			qr_checkin_submissions: []
		})

		let qr_checkin_submissions = []
		let submission_ids = Array.from(SeedHelper.functions.getRandomIDsFromArray(
			course.students, num_live_submissions))
		for(let i = 0; i < num_live_submissions; i++) {
			qr_checkin_submissions.push(new SeedHelper.models.LiveSubmission({
				submitter: submission_ids[i],
				live_submission_time: SeedHelper.functions.getRandomTimeBetweenTwoTimes(
															qr_checkin.qr_checkin_start_time,
															qr_checkin.qr_checkin_end_time),
				is_qr_checkin_submission: true,
				qr_checkin: qr_checkin._id,
			}))
		}
		qr_checkin.qr_checkin_submissions = qr_checkin_submissions

		qr_checkins.push(qr_checkin)
		live_submissions = live_submissions.concat(qr_checkin_submissions)
	}

	if(has_async_attendance) {
		let recording_submission_start = null,
				recording_submission_end = null
		// Use the meeting times if possible otherwise generate times for the recording
		if(only_async_meeting) {
			let meeting_times = SeedHelper.functions.getPastMeetingTimes(is_monday_meeting)
			recording_submission_start = meeting_times.meeting_start
			recording_submission_end = meeting_times.meeting_end
			is_monday_meeting = !is_monday_meeting
		} else {
			recording_submission_start = meeting_start
			recording_submission_end = meeting_end
		}
		let recording = new SeedHelper.models.Recording({
			video_url: "https://storage.googleapis.com/venue_videos/sample1.mp4",
			recording_submission_start_time: recording_submission_start,
			recording_submission_end_time: recording_submission_end,
			recording_submissions: []
		})

		let recording_submissions = []
		let submission_ids = Array.from(SeedHelper.functions.getRandomIDsFromArray(
			course.students, num_async_submissions))
		for(let i = 0; i < num_async_submissions; i++) {
			// Length of sample1.mp4 is 13 seconds
			let video_length = 13
			let furthest_video_time = SeedHelper.functions.getRandomInt(0,video_length)
			recording_submissions.push(new SeedHelper.models.AsyncSubmission({
				submitter: submission_ids[i],
				is_recording: true,
				recording: recording._id,
				furthest_video_time: furthest_video_time,
				video_percent_watched: furthest_video_time/13
			}))
		}
		recording.recording_submissions = recording_submissions

		recordings.push(recording)
		async_submissions = async_submissions.concat(recording_submissions)
	}

	// Update the course, instructor, and students
	course.meetings.push(meeting)
	course.instructor.meetings.push(meeting)
	course.students.forEach(student => student.meetings.push(meeting))

	live_attendances.push(meeting.live_attendance)
	async_attendances.push(meeting.async_attendance)
	meetings.push(meeting)
}