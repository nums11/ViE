const SeedHelper = require('./seed_helper')

module.exports = {initSmallSeed, initMediumSeed, initLargeSeed};

let SeedModels = {
	instructors: [],
	students: [],
	courses: [],
	meetings: [],
	live_attendances: [],
	async_attendances: [],
	qr_checkins: [],
	recordings: [],
	live_submissions: [],
	async_submissions: [],
}
let seed_size = process.env.seed_size

if(seed_size === "small")
	initSmallSeed()
else if(seed_size === "medium")
	initMediumSeed()
else if(seed_size === "large")
	initLargeSeed()

/*
Seeds database with these parameters
- 1 Instructor
- 16 Students
- 1 Course
- 3 Meetings for the course
	- 1 with only live attendance
	- 1 with only async attendance
	- 1 with both live and async attendance
- Meetings with live attendance have 10 live submissions
- Meetings with async attendance have 5 async submissions
*/
async function initSmallSeed() {
	await SeedHelper.clearAllModels()
	await SeedHelper.createInstructor(true, SeedModels)
	await SeedHelper.createStudents(16, SeedModels)
	SeedHelper.createCourse("RCOS", "CSCI", 2961,
		SeedModels.instructors[0], null, SeedModels.students,
		SeedModels)
	SeedHelper.createMeetingsForCourse(3,
		SeedModels.courses[0], seed_size, SeedModels)
	console.log("About to populateModels:", SeedModels.students.length)
	SeedHelper.populateModels(SeedModels)
	SeedHelper.clearSeedModels(SeedModels)
	for([key,value] of Object.entries(SeedModels)) {
		console.log("key",key,"Value",value)
	}
}

/*
Seeds database with these parameters
- 2 Instructors
- 50 Students
- 2 Courses
	- 1 with 2 instructors
- 15 Meetings for both courses
	- 5 with only live attendance
	- 5 with only async attendance
	- 5 with both live and async attendance
- Meetings with live attendance have 40 live submissions
- Meetings with async attendance have 25 async submissions
*/
async function initMediumSeed() {
	await SeedHelper.clearAllModels()
	await SeedHelper.createInstructor(true, SeedModels)
	await SeedHelper.createInstructor(false, SeedModels)
	await SeedHelper.createStudents(50, SeedModels)
	SeedHelper.createCourse("RCOS", "CSCI", 2961,
		SeedModels.instructors[0], null,
		SeedModels.students, SeedModels)
	SeedHelper.createCourse("Data Structures", "CSCI", 1200,
		SeedModels.instructors[0], SeedModels.instructors[1],
		SeedModels.students, SeedModels)
	SeedHelper.createMeetingsForCourse(15,
		SeedModels.courses[0], seed_size, SeedModels)
	SeedHelper.createMeetingsForCourse(15,
		SeedModels.courses[1], seed_size, SeedModels)
	SeedHelper.populateModels(SeedModels)
	SeedHelper.clearSeedModels(SeedModels)

}

/*
Seeds database with these parameters
- 2 Instructors
- 300 Students
- 2 Courses
- 90 Meetings for both courses
	- 30 with only live attendance
	- 30 with only async attendance
	- 30 with both live and async attendance
- Meetings with live attendance have 100 live submissions
- Meetings with async attendance have 80 async submissions
*/
async function initLargeSeed() {
	await SeedHelper.clearAllModels()
	await SeedHelper.createInstructor(true, SeedModels)
	await SeedHelper.createInstructor(false, SeedModels)
	await SeedHelper.createStudents(300, SeedModels)
	SeedHelper.createCourse("RCOS", "CSCI", 2961,
		SeedModels.instructors[0], null,
		SeedModels.students, SeedModels)
	SeedHelper.createCourse("Data Structures", "CSCI", 1200,
		SeedModels.instructors[0], SeedModels.instructors[1],
		SeedModels.students, SeedModels)
	SeedHelper.createMeetingsForCourse(90,
		SeedModels.courses[0], seed_size, SeedModels)
	SeedHelper.createMeetingsForCourse(90,
		SeedModels.courses[1], seed_size, SeedModels)
	SeedHelper.populateModels(SeedModels)
	SeedHelper.clearSeedModels(SeedModels)
}





