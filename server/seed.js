const seeder = require("mongoose-seed");
const Course = require("./Course/Course.model")
const Organization = require("./Organization/Organization.model")
const Event = require("./Event/Event.model")
const Section = require("./Section/Section.model")
const Submission = require("./Submission/Submission.model")
const User = require("./User/User.model")
const Lecture = require("./Lecture/Lecture.model")
const LectureSubmission = require("./LectureSubmission/LectureSubmission.model")
const Poll = require("./Poll/Poll.model")

const db = "mongodb://localhost:27017/Venue2v2";

const bcrypt = require('bcrypt');
const saltRounds = 10;

seeder.connect(process.env.MONGODB_URI || db, function () {
	seeder.loadModels([
		"./Course/Course.model",
		"./User/User.model",
		"./Section/Section.model",
		"./Event/Event.model",
		"./Submission/Submission.model",
		"./Lecture/Lecture.model",
		"./LectureSubmission/LectureSubmission.model",
		"./Poll/Poll.model",
		"./Organization/Organization.model"
	]);
	seeder.clearModels(['Course', 'User', 'Organization', 'Section', 'Event', 'Submission', 'Lecture', 'LectureSubmission', 'Poll'], function () {

		let users = []
		let courses = []
		let organizations = []

		// Creating Users

		users.push(new User({ // 0
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
		}))

		users.push(new User({ // 1
			first_name: "John",
			last_name: "Doe",
			user_id: "testinst",
			email: "testinst@rpi.edu",
			password: "password",
			is_instructor: true,
			is_admin: false,
			instructor_courses: [],
			student_courses: [],
			users_orgs: [],
			meetings: [],
			live_submissions: [],
			async_submissions: [],
		}))

		for(let i=0;i<26;i++) {  // 2-27 (a-z)
			var chr = String.fromCharCode(97 + i);
			users.push(new User({
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

		// Creating Courses

		courses.push(new Course({ // 0
			name: "RCOS",
			dept: "CSCI",
			course_number: 2961,
			instructor: users[0]._id,
			students: [users[2]._id, users[3]._id, users[4]._id],
			meetings: []
		}))
		users[0].instructor_courses.push(courses[0])
		users[2].student_courses.push(courses[0])
		users[3].student_courses.push(courses[0])
		users[4].student_courses.push(courses[0])

		courses.push(new Course({ // 1
			name: "Data Structures",
			dept: "CSCI",
			course_number: 1200,
			instructor: users[0]._id,
			students: [users[2]._id, users[3]._id, users[4]._id, users[5]._id, users[6]._id],
			meetings: []
		}))
		users[0].instructor_courses.push(courses[1])
		users[2].student_courses.push(courses[1])
		users[3].student_courses.push(courses[1])
		users[4].student_courses.push(courses[1])
		users[5].student_courses.push(courses[1])
		users[6].student_courses.push(courses[1])

		// Creating organizations

		organizations.push(new Organization({
			name: "NSBE",
			board_members: [users[2], users[3]._id, users[4]._id, users[5]._id],
			general_members: [users[6],users[7],users[8]]
		}))
		users[2].user_orgs.push(organizations[0])
		users[3].user_orgs.push(organizations[0])
		users[4].user_orgs.push(organizations[0])
		users[5].user_orgs.push(organizations[0])
		users[6].user_orgs.push(organizations[0])
		users[7].user_orgs.push(organizations[0])
		users[8].user_orgs.push(organizations[0])

		// Hash user passwords

		let promises = []
		users.forEach(user => {
			promises.push(new Promise((resolve,reject) => {
				bcrypt.hash(user.password,saltRounds,(err,hash) => {
					resolve(hash)
				})
			}))
		})

		Promise.all(promises)
			.then((fulfilled) => {
				for(i=0;i<users.length;i++){
					users[i].password = fulfilled[i]
				}

				let data = [{
					"model": "User",
					"documents": users
				}, {
					"model": "Course",
					"documents": courses
				}, {
					"model": "Organization",
					"documents": organizations
				}
				]

				seeder.populateModels(data, function (err, done) {
					if (err) {
						return console.log("seed err", err)
					}
					if (done) {
						return console.log("seed finished", done)
					}
					seeder.disconnect()
				})
			})
			.catch(err => {
				console.log("ERROR IN RESOLVING HASHED PASSWORDS",err)
			})
	});
});