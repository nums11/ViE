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
		"./Poll/Poll.model"
	]);
	seeder.clearModels(['Course', 'User', 'Section', 'Event', 'Submission', 'Lecture', 'LectureSubmission', 'Poll'], function () {

		let users = []
		let courses = []
		let sections = []
		let organizations = []
		// let meetings = []
		// let  = []
		// let p = []

		// Creating Users

		users.push(new User({ // 0
			first_name: "Numfor",
			last_name: "Mbiziwo-Tiapo",
			user_id: "mbizin",
			email: "venue@rpi.edu",
			password: "nimda",
			is_instructor: true,
			is_admin: true,
			ta_sections: [],
			submissions: []
		}))

		users.push(new User({ // 1
			first_name: "John",
			last_name: "Doe",
			user_id: "testinst",
			email: "testinst@rpi.edu",
			password: "password",
			is_instructor: true,
			is_admin: false,
			ta_sections: [],
			submissions: []
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
				ta_sections: [],
			}))
		}

		// Creating Sections

		sections.push(new Section({ // 1
			// course: c[1]._id,
			number: 1,
			students: [users[2]._id, users[3]._id],
			// teaching_assistants: [u[0]._id]
		}))

		sections.push(new Section({ // 2
			// course: c[1]._id,
			number: 2,
			students: [users[2]._id, users[4]._id],
			// teaching_assistants: [u[0]._id]
		}))

		sections.push(new Section({ // 3
			// course: c[4]._id,
			number: 1,
			students: [
				users[2]._id,
				users[3]._id,
				users[4]._id,
				users[5]._id,
				users[6]._id,
				users[7]._id,
				users[8]._id,
				users[9]._id,
				users[10]._id,
				users[11]._id,
				users[12]._id,
				users[13]._id
			],
			// teaching_assistants: [
			// 	u[26]._id
			// 	// u[27]._id
			// ]
		}))

		sections.push(new Section({ // 4
			// course: c[4]._id,
			number: 2,
			students: [
				users[2]._id,
				users[14]._id,
				users[15]._id,
				users[16]._id,
				users[17]._id,
				users[18]._id,
				users[19]._id,
				users[20]._id,
				users[21]._id,
				users[22]._id,
				users[23]._id,
				users[24]._id,
				users[25]._id
			],
			// teaching_assistants: [
			// 	u[27]._id
			// ]
		}))

		// Creating Courses

		courses.push(new Course({ // 0
			name: "RCOS",
			dept: "CSCI",
			course_number: 2961,
			instructor: users[0]._id,
			sections: [sections[0], sections[1]]
		}))

		courses.push(new Course({ // 1
			name: "Data Structures",
			dept: "CSCI",
			course_number: 1200,
			instructor: users[0]._id,
			sections: [sections[2], sections[3]]
		}))

		organizations.push(new Organization({
			name: "NSBE",
			board_members: [users[0]],
			general_members: [users[1],users[2],users[3]]
		}))

		// courses.push(new Course({ // 2
		// 	name: "Multiletiable Calculus",
		// 	dept: "MATH",
		// 	course_number: 2010,
		// 	instructor: u[0]._id
		// }))

		// courses.push(new Course({ // 3
		// 	name: "Physics I",
		// 	dept: "PHYS",
		// 	course_number: 1100,
		// 	instructor: u[0]._id
		// }))

		// courses.push(new Course({ // 4
		// 	name: "Testing Course",
		// 	dept: "TEST",
		// 	course_number: 1000,
		// 	instructor: u[1]._id
		// }))

		// m.push(new Lecture({ // 0
		// 	title: "Live Lecture",
		// 	sections: [s[1]._id],
		// 	allow_live_submissions: true,
		// 	allow_playback_submissions: false,
		// 	start_time: Date.now(),
		// 	end_time: Date.now() + (2*60*60*1000),
		// 	checkins: [{
		// 		start_time: Date.now() + (60*1000),
		// 		end_time: Date.now() + (2*60*1000),
		// 		code: "abcdefghijklmnopqrstuvwxyz",
		// 	},{
		// 		start_time: Date.now() + (3*60*1000),
		// 		end_time: Date.now() + (4*60*1000),
		// 		code: "zyxwvutsrqponmlkjihgfedcba",
		// 	}],
		// 	num_playback_polls: 0
		// }))

		// l.push(new Lecture({ // 1
		// 	title: "Playback Lecture",
		// 	sections: [s[1]._id,s[2]._id],
		// 	allow_live_submissions: false,
		// 	allow_playback_submissions: true,
		// 	checkins: [{
		// 		start_time: Date.now() - (4*60*1000),
		// 		end_time: Date.now() - (3*60*1000),
		// 		code: "abcdefghijklmnopqrstuvwxyz",
		// 	},{
		// 		start_time: Date.now() - (2*60*1000),
		// 		end_time: Date.now() - (60*1000),
		// 		code: "zyxwvutsrqponmlkjihgfedcba",
		// 	}],
		// 	playback_submission_start_time: Date.now(),
		// 	playback_submission_end_time: Date.now() + (3*60*1000),
		// 	video_ref: "/videos/sample/sample.mp4",
		// 	num_playback_polls: 2
		// }))

		// l.push(new Lecture({ // 2
		// 	title: "Upcoming Playback Lecture",
		// 	sections: [s[1]._id],
		// 	allow_live_submissions: false,
		// 	allow_playback_submissions: true,
		// 	playback_submission_start_time: Date.now() + (2*60*1000),
		// 	playback_submission_end_time: Date.now() + (4*60*1000),
		// 	video_ref: "/videos/sample/sample.mp4",
		// 	num_playback_polls: 2
		// }))

		// l.push(new Lecture({ // 3
		// 	title: "How to use Venue",
		// 	sections: [s[0]._id],
		// 	allow_live_submissions: true,
		// 	allow_playback_submissions: false,
		// 	start_time: Date.now(),
		// 	end_time: Date.now() + (2*60*60*1000),
		// 	checkins: [{
		// 		start_time: Date.now() + (60*1000),
		// 		end_time: Date.now() + (3*60*1000),
		// 		code: "abcdefghijklmnopqrstuvwxyz",
		// 	}],
		// 	num_playback_polls: 2
		// }))

		// ls.push(new LectureSubmission({ // 0
		// 	lecture: l[1]._id,
		// 	submitter: u[2]._id,
		// 	is_live_submission: true,
		// 	code: "abcdefghijklmnopqrstuvwxyz",
		// 	live_submission_time: Date.now() - (3.5*60*1000)
		// }))

		// p.push(new PlaybackPoll({ // 0
		// 	lecture: l[1]._id,
		// 	question: "Where is my super suit?",
		// 	possible_answers: [
		// 		"I, uh, put it away.",
		// 		"Why do you need to know?"
		// 	],
		// 	correct_answers: [
		// 		"Why do you need to know?"
		// 	],
		// 	timestamp: 5
		// }))

		// p.push(new PlaybackPoll({ // 1
		// 	lecture: l[1]._id,
		// 	question: "Speed of light?",
		// 	possible_answers: [
		// 		"Fast",
		// 		"2Fast"
		// 	],
		// 	correct_answers: [
		// 		"2Fast"
		// 	],
		// 	timestamp: 15
		// }))

		// p.push(new PlaybackPoll({ // 2
		// 	lecture: l[2]._id,
		// 	question: "What's 9 + 10?",
		// 	possible_answers: [
		// 		"19",
		// 		"21"
		// 	],
		// 	correct_answers: [
		// 		"21"
		// 	],
		// 	timestamp: 10
		// }))

		// p.push(new PlaybackPoll({ // 3
		// 	lecture: l[2]._id,
		// 	question: "Are you smart m8?",
		// 	possible_answers: [
		// 		"Yeah",
		// 		"kinda",
		// 		"nah",
		// 	],
		// 	correct_answers: [
		// 		"nah"
		// 	],
		// 	timestamp: 15
		// }))

		// p.push(new PlaybackPoll({ // 4
		// 	lecture: l[3]._id,
		// 	question: "What is this planet?",
		// 	possible_answers: [
		// 		"Mercury",
		// 		"Venus",
		// 		"Earth",
		// 		"Mars",
		// 		"Jupiter",
		// 		"Saturn",
		// 		"Uranus",
		// 		"Neptune"
		// 	],
		// 	correct_answers: [
		// 		"Earth"
		// 	],
		// 	timestamp: 5
		// }))

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