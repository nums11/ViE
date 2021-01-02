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
	quiz_answers: [{
		type: String
	}],
	correct_percentage: Number,
	furthest_video_time: Number,
	video_percent_watched: Number
});

module.exports = mongoose.model('Submission', Submission);
