const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Course = require('../Course/Course.model');
let Section = require('../Section/Section.model');
let Meeting = require('../Meeting/Meeting.model');
let Submission = require('../Submission/Submission.model');
let AsyncSubmission = require('../AsyncSubmission/AsyncSubmission.model');

//Define collection and schema for User
let User = new Schema({
	first_name: {
		type: String,
		required: true
	},
	last_name: {
		type: String,
		required: true
	},
	user_id: {
		type: String,
		required: true
	},
	email: String,
	temp_password: String,
	password: String,
	instructor_courses: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Course'
	}],
	student_sections: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Section'
	}],
	pending_approval_sections: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Section'
	}],
	meetings: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Meeting'
	}],
	submissions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Submission'
	}],
	async_submissions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'AsyncSubmission'
	}],
	connect_sid: {
		type: String,
		default: ""
	},
	is_admin: {
		type: Boolean,
		default: false,
		required: true
	},
	is_instructor: {
		type: Boolean,
		default: false,
		required: true
	},
	service_worker_subscriptions: [{}],
	updated_auth_header: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('User', User);