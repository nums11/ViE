const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LiveSubmission = require('../LiveSubmission/LiveSubmission.model');
let Recording = require('../Recording/Recording.model');
let PollQuestion = require('../PollQuestion/PollQuestion.model');

//Define collection and schema for User
let Poll = new Schema({
	is_live_poll: {type: Boolean, default: false},
	recording: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Recording'
	},
	recording_timestamp: {
		type: Number,
		default: 0
	},
	poll_questions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'PollQuestion'
	}],
	has_correct_answers: {type: Boolean, default: false},
	live_poll_submissions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'LiveSubmission'
	}]
});

module.exports = mongoose.model('Poll', Poll);
