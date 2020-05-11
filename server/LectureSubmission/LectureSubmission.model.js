const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Lecture = require('../Lecture/Lecture.model');

//Define collection and schema for LectureSubmission
let LectureSubmission = new Schema({
	lecture: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Lecture'
	},
	submitter: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	video_progress: Number,
	student_poll_answers: [
		[{
			type: String,
			default: ""
		}]
	]
});

module.exports = mongoose.model('LectureSubmission', LectureSubmission);