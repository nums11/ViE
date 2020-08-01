const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = require('../User/User.model');
let PollQuestion = require('../PollQuestion/PollQuestion.model');
let PollAnswers = require('../PollAnswers/PollAnswers.model');

let LiveSubmission = new Schema({
	submitter: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	live_submission_time: Date,
	live_submission_type: {
		is_qr_checkin: { type: Boolean, default: false },
		is_live_poll: { type: Boolean, default: false },
	},
	poll_answers: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'PollAnswers'
	}
});

module.exports = mongoose.model('LiveSubmission', LiveSubmission);
