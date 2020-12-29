const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = require('../User/User.model');
let QRScan = require('../QRScan/QRScan.model');
// let Poll = require('../Poll/Poll.model');
// let PollAnswers = require('../PollAnswers/PollAnswers.model');

let Submission = new Schema({
	submitter: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	submission_time: {
		type: Date,
		required: true
	},
	is_qr_scan_submission: { type: Boolean, default: false },
	qr_scan: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'QRScan',
		required: true
	},
	// poll: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: 'Poll'
	// },
	// poll_answers: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: 'PollAnswers'
	// }
});

module.exports = mongoose.model('Submission', Submission);
