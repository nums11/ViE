const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PollAnswers = require('../PollAnswers/PollAnswers.model');

let AsyncSubmisson = new Schema({
	submitter: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	async_submission_type: {
		is_recording: { type: Boolean, default: false },
		is_file: { type: Boolean, default: false },
		is_link: { type: Boolean, default: false },
	},
	futhest_video_time: Number,
	video_percent: Number,
	poll_answers: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'PollAnswers'
	}],
	poll_answers: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'PollAnswers'
	},
	file_or_link_submission_time: Date,
});

module.exports = mongoose.model('AsyncSubmisson', AsyncSubmisson);
