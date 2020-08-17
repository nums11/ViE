const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Recording = require('../Recording/Recording.model');
let PollAnswers = require('../PollAnswers/PollAnswers.model');

let AsyncSubmission = new Schema({
	submitter: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	is_recording: { type: Boolean, default: false },
	is_file: { type: Boolean, default: false },
	is_link: { type: Boolean, default: false },
	recording: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Recording'
	},
	furthest_video_time: { type: Number, default: 0 },
	video_percent_watched: { type: Number, default: 0 },
	poll_answers: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'PollAnswers'
	},
	file_or_link_submission_time: Date,
});

module.exports = mongoose.model('AsyncSubmission', AsyncSubmission);
