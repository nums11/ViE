const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../User/User.model');

const Submission = new Schema({
	submitter: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	// Either 'QRScan', 'Quiz', 'Video', or 'Link'
	task_type: {
		type: String,
		required: true
	},
	quiz_answer_indices: {
		type: Array,
		required: true
	},
	num_correct_answers: {
		type: Number,
		default: 0
	},
	furthest_video_time: {
		type: Number,
		default: 0
	},
	video_percent_watched: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('Submission', Submission);
