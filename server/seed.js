const seeder = require("mongoose-seed");
const Course = require("./Course/Course.model")
const RealTimePortion = require("./RealTimePortion/RealTimePortion.model")
const AsyncPortion = require("./AsyncPortion/AsyncPortion.model")
const Submission = require("./Submission/Submission.model")
const QRScan = require("./QRScan/QRScan.model")
const Video = require("./Video/Video.model")
const Quiz = require("./Quiz/Quiz.model")
const QuizQuestion = require("./QuizQuestion/QuizQuestion.model")
const User = require("./User/User.model")
const Section = require("./Section/Section.model")

const db = "mongodb://localhost:27017/Venue2v2";

const bcrypt = require('bcrypt');
const saltRounds = 10;

seeder.connect(process.env.DB_URI || db, function () {
	seeder.loadModels([
		"./Course/Course.model",
		"./User/User.model",
		"./Meeting/Meeting.model",
		"./RealTimePortion/RealTimePortion.model",
		"./AsyncPortion/AsyncPortion.model",
		"./Submission/Submission.model",
		"./QRScan/QRScan.model",
		"./Video/Video.model",
		"./Section/Section.model",
		"./Quiz/Quiz.model",
		"./QuizQuestion/QuizQuestion.model"
	]);
	seeder.clearModels(['Course', 'User', 'Meeting',
		'RealTimePortion', 'AsyncPortion', 'Submission',
		'QRScan', 'Video', 'Section', 'Quiz', 'QuizQuestion'],
		function () {

		let users = []
		let courses = []
		let sections = []
		let organizations = []

		// Creating Users

		users.push(new User({ // 0
			first_name: "Fake",
			last_name: "Inst",
			user_id: "fakeinst",
			email: "fakeinst@gmail.com",
			password: "nimda",
			is_instructor: true,
			is_admin: true,
			instructor_courses: [],
			student_sections: [],
			pending_approval_sections: [],
			users_orgs: [],
			meetings: [],
			submissions: [],
			async_submissions: [],
		}))

		users.push(new User({ // 1
			first_name: "John",
			last_name: "Doe",
			user_id: "testinst",
			email: "testinst@gmail.com",
			password: "password",
			is_instructor: true,
			is_admin: false,
			instructor_courses: [],
			student_sections: [],
			pending_approval_sections: [],
			users_orgs: [],
			meetings: [],
			submissions: [],
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
				pending_approval_sections: [],
				users_orgs: [],
				meetings: [],
				submissions: [],
				async_submissions: [],
			}))
		}

		users[5] = new User({ // 1
			first_name: "Numfor",
			last_name: "Mbiziwo-Tiapo",
			user_id: "numsmt2",
			email: "numsmt2@gmail.com",
			password: "password",
			is_instructor: false,
			is_admin: false,
			instructor_courses: [],
			student_sections: [],
			pending_approval_sections: [],
			users_orgs: [],
			meetings: [],
			submissions: [],
			async_submissions: [],
		})

		// Creating Courses

		courses.push(new Course({ // 0
			name: "RCOS",
			dept: "CSCI",
			course_number: 2961,
			instructor: users[0]._id,
			sections: []
		}))
		sections.push(new Section({
			section_number: 1,
			course: courses[0]._id,
			students: [users[2]._id, users[3]._id, users[4]._id,
			users[5]._id,users[6]._id,users[7]._id,users[8]._id,
			users[9]._id,users[10]._id,users[11]._id,users[12]._id,
			users[13]._id,users[14]._id,users[15]._id,users[16]._id,],
			pending_approval_students: [users[17]._id, users[18]._id,
			users[19]._id, users[20]._id],
			meetings: [],
			join_code: getJoinCodeForSection(1,courses[0]._id),
			has_open_enrollment: false
		}))
		courses[0].sections.push(sections[0]._id)
		users[0].instructor_courses.push(courses[0]._id)
		users[2].student_sections.push(sections[0]._id)
		users[3].student_sections.push(sections[0]._id)
		users[4].student_sections.push(sections[0]._id)
		users[5].instructor_courses.push(courses[0]._id)
		users[6].student_sections.push(sections[0]._id)
		users[7].student_sections.push(sections[0]._id)
		users[8].student_sections.push(sections[0]._id)
		users[9].instructor_courses.push(courses[0]._id)
		users[10].student_sections.push(sections[0]._id)
		users[11].student_sections.push(sections[0]._id)
		users[12].student_sections.push(sections[0]._id)
		users[13].instructor_courses.push(courses[0]._id)
		users[14].student_sections.push(sections[0]._id)
		users[15].student_sections.push(sections[0]._id)
		users[16].student_sections.push(sections[0]._id)
		users[17].pending_approval_sections.push(sections[0]._id)
		users[18].pending_approval_sections.push(sections[0]._id)
		users[19].pending_approval_sections.push(sections[0]._id)
		users[20].pending_approval_sections.push(sections[0]._id)

		courses.push(new Course({ // 1
			name: "Data Structures",
			dept: "CSCI",
			course_number: 1200,
			instructor: users[0]._id,
			meetings: []
		}))
		sections.push(new Section({
			section_number: 1,
			course: courses[1]._id,
			students: [users[2]._id, users[3]._id, users[4]._id, users[5]._id, users[6]._id],
			meetings: [],
			join_code: getJoinCodeForSection(1,courses[1]._id)
		}))
		sections.push(new Section({
			section_number: 2,
			course: courses[1]._id,
			students: [users[7]._id, users[8]._id, users[9]._id, users[10]._id, users[11]._id],
			meetings: [],
			join_code: getJoinCodeForSection(2,courses[1]._id),
			has_open_enrollment: true
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

		// Hash user passwords
		for(let i=0; i < users.length; i++){
			users[i].password = bcrypt.hashSync(users[i].password,
				saltRounds)
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
	});
});

function getJoinCodeForSection(section_number, course_id) {
  let random_string = generateRandomString()
  return `${section_number}${course_id}${random_string}`
}

function generateRandomString() {
  let length = 10,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      str = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
      str += charset.charAt(Math.floor(Math.random() * n))
  }
  return str
}
