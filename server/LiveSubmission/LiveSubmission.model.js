const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = require('../User/User.model');
let QRCheckin = require('../QRCheckin/QRCheckin.model');
let Poll = require('../Poll/Poll.model');
let PollAnswers = require('../PollAnswers/PollAnswers.model');

let LiveSubmission = new Schema({
	submitter: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	live_submission_time: Date,
	is_qr_checkin_submission: { type: Boolean, default: false },
	qr_checkin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'QRCheckin'
	},
	poll: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Poll'
	},
	poll_answers: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'PollAnswers'
	}
});

module.exports = mongoose.model('LiveSubmission', LiveSubmission);
