const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Poll = require('../Poll/Poll.model');
let AsyncSubmission = require('../AsyncSubmission/AsyncSubmission.model');

//Define collection and schema for User
let Recording = new Schema({
	video_url: String,
	recording_polls: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Poll'
	},
	// TODO: default this to false and allow instructors to upload
	// recordings that don't count for submissions
	allow_recording_submissions: { type: Boolean, default: true },
	recording_submission_start_time: Date,
	recording_submission_end_time: Date,
	recording_submissions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'AsyncSubmission'
	}]
});

module.exports = mongoose.model('Recording', Recording);
