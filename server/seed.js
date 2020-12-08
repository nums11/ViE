const seeder = require("mongoose-seed");
const Course = require("./Course/Course.model")
const Organization = require("./Organization/Organization.model")
const LiveAttendance = require("./LiveAttendance/LiveAttendance.model")
const AsyncAttendance = require("./AsyncAttendance/AsyncAttendance.model")
const LiveSubmission = require("./LiveSubmission/LiveSubmission.model")
const AsyncSubmission = require("./AsyncSubmission/AsyncSubmission.model")
const QRCheckin = require("./QRCheckin/QRCheckin.model")
const Recording = require("./Recording/Recording.model")
const User = require("./User/User.model")
const Poll = require("./Poll/Poll.model")
const Meeting = require("./Meeting/Meeting.model")
const Section = require("./Section/Section.model")

const db = "mongodb://localhost:27017/Venue2v2";

const bcrypt = require('bcrypt');
const saltRounds = 10;

seeder.connect(process.env.MONGODB_URI || db, function () {
	seeder.loadModels([
		"./Course/Course.model",
		"./User/User.model",
		"./Poll/Poll.model",
		"./Organization/Organization.model",
		"./Meeting/Meeting.model",
		"./LiveAttendance/LiveAttendance.model",
		"./AsyncAttendance/AsyncAttendance.model",
		"./LiveSubmission/LiveSubmission.model",
		"./AsyncSubmission/AsyncSubmission.model",
		"./QRCheckin/QRCheckin.model",
		"./Recording/Recording.model",
		"./Section/Section.model"
	]);
	seeder.clearModels(['Course', 'User', 'Organization', 'Meeting',
		'LiveAttendance', 'AsyncAttendance', 'LiveSubmission', 'AsyncSubmission',
		'QRCheckin', 'Recording', 'Poll', 'Section'], function () {

		let users = []
		let courses = []
		let sections = []
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
			student_sections: [],
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
			student_sections: [],
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
				student_sections: [],
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
			sections: []
			// students: [users[2]._id, users[3]._id, users[4]._id],
			// meetings: []
		}))
		sections.push(new Section({
			section_number: 1,
			course: courses[0]._id,
			students: [users[2]._id, users[3]._id, users[4]._id],
			meetings: []
		}))
		courses[0].sections.push(sections[0]._id)
		users[0].instructor_courses.push(courses[0]._id)
		users[2].student_sections.push(sections[0]._id)
		users[3].student_sections.push(sections[0]._id)
		users[4].student_sections.push(sections[0]._id)

		courses.push(new Course({ // 1
			name: "Data Structures",
			dept: "CSCI",
			course_number: 1200,
			instructor: users[0]._id,
			// students: [users[2]._id, users[3]._id, users[4]._id, users[5]._id, users[6]._id,
			// users[7]._id, users[8]._id, users[9]._id, users[10]._id, users[11]._id,],
			meetings: []
		}))
		sections.push(new Section({
			section_number: 1,
			course: courses[1]._id,
			students: [users[2]._id, users[3]._id, users[4]._id, users[5]._id, users[6]._id],
			meetings: []
		}))
		sections.push(new Section({
			section_number: 2,
			course: courses[1]._id,
			students: [users[7]._id, users[8]._id, users[9]._id, users[10]._id, users[11]._id],
			meetings: []
		}))
		courses[1].sections.push(sections[1]._id)
		courses[1].sections.push(sections[2]._id)
		users[0].instructor_courses.push(courses[1]._id)
		users[2].student_sections.push(sections[1]._id)
		users[3].student_sections.push(sections[1]._id)
		users[4].student_sections.push(sections[1]._id)
		users[5].student_sections.push(sections[1]._id)
		users[6].student_sections.push(sections[1]._id)
		users[7].student_sections.push(sections[2]._id)
		users[8].student_sections.push(sections[2]._id)
		users[9].student_sections.push(sections[2]._id)
		users[10].student_sections.push(sections[2]._id)
		users[11].student_sections.push(sections[2]._id)


		// Creating organizations

		// organizations.push(new Organization({
		// 	name: "NSBE",
		// 	board_members: [users[2]._id, users[3]._id, users[4]._id, users[5]._id],
		// 	general_members: [users[6],users[7],users[8]]
		// }))
		// users[2].user_orgs.push(organizations[0])
		// users[3].user_orgs.push(organizations[0])
		// users[4].user_orgs.push(organizations[0])
		// users[5].user_orgs.push(organizations[0])
		// users[6].user_orgs.push(organizations[0])
		// users[7].user_orgs.push(organizations[0])
		// users[8].user_orgs.push(organizations[0])

		// organizations.push(new Organization({
		// 	name: "BSA",
		// 	board_members: [users[0]._id, users[1]._id],
		// 	general_members: [users[2]._id,users[3]._id,users[4]._id,users[5]._id,users[6]._id,users[7]._id]
		// }))
		// users[0].user_orgs.push(organizations[1])
		// users[1].user_orgs.push(organizations[1])
		// users[2].user_orgs.push(organizations[1])
		// users[3].user_orgs.push(organizations[1])
		// users[4].user_orgs.push(organizations[1])
		// users[5].user_orgs.push(organizations[1])
		// users[6].user_orgs.push(organizations[1])
		// users[7].user_orgs.push(organizations[1])

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
					"model": "Section",
					"documents": sections
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