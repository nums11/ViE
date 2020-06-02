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
			type: Boolean,
			default: ""
		}]
	],
	is_live_submission: { type: Boolean, default: false },
	// TODO: Store live submission time
});

module.exports = mongoose.model('LectureSubmission', LectureSubmission);