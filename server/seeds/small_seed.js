const SeedHelper = require('./seed_helper')

SeedHelper.functions.clearAllModels()

// Create Users (17)
let users = []

// 1 Instructor
users.push(new SeedHelper.models.User({ // 0
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

// 16 Students
for(let i=0;i<16;i++) { //a-p (1-17)
	var chr = String.fromCharCode(97 + i);
	users.push(new SeedHelper.models.User({
		first_name: "Student",
		last_name: chr,
		user_id: "student" + chr,
		email: "student"+chr+"@rpi.edu",
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

// Create Courses (1)
let courses = []

courses.push(new SeedHelper.models.Course({ // 0
	name: "RCOS",
	dept: "CSCI",
	course_number: 2961,
	instructor: users[0]._id,
	students: SeedHelper.functions.getObjectIDsFromArray(users, 1, 17),
	meetings: []
}))

// Create Meetings (4)
let meetings = []
let live_attendances = []
let qr_checkins = []
let live_submissions = []
let async_atttendances = []
let recordings = []
let async_submissions = []

// 2 past meetings (1 with async)
let {meeting_start, meeting_end} = 
	SeedHelper.functions.getPreviousMondayMeetingTimes()
console.log("Meeting Start", meeting_start.toString())
console.log("Meeting End", meeting_end.toString())

meetings.push(new SeedHelper.models.Meeting({
	title: "Meeting 1",
	start_time: meeting_start,
	end_time: meeting_end,
	for_course: true,
	course: courses[0]._id
	has_live_attendance: true,
	has_async_attendance: false,
	live_attendance: null,
	async_atttendance: null
}))

live_attendances.push(new SeedHelper.models.LiveAttendance({
	qr_checkins: []
}))

qr_checkins.push(new SeedHelper.models.QRCheckin({
	code: SeedHelper.functions.generateRandomCode(),
	qr_checkin_start_time: null,
	qr_checkin_end_time: null,
	qr_checkins_submissions: []
}))

// 1 ongoing meeting (live)

// meetings.push(new Meeting({

// }))

// Create Submissions for those meetings


// console.log(c)