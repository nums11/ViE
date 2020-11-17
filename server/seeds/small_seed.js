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

SeedHelper.clearAllModels()
SeedHelper.createInstructor(true, SeedModels)
SeedHelper.createStudents(16, SeedModels)
SeedHelper.createCourse("RCOS", "CSCI", 2961,
	SeedModels.instructors[0], SeedModels.students,
	SeedModels)
SeedHelper.createMeeting(SeedModels.courses[0],
	true, 9, false, 0, SeedModels)
SeedHelper.createMeeting(SeedModels.courses[0],
	true, 10, true, 5, SeedModels)
SeedHelper.createMeeting(SeedModels.courses[0],
	false, 0, true, 5, SeedModels)
SeedHelper.populatModels(SeedModels)


