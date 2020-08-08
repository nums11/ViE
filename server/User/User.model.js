const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Course = require('../Course/Course.model');
let Organization = require('../Organization/Organization.model');
let Meeting = require('../Meeting/Meeting.model');
let LiveSubmission = require('../LiveSubmission/LiveSubmission.model');
let AsyncSubmission = require('../AsyncSubmission/AsyncSubmission.model');

//Define collection and schema for User
let User = new Schema({
	first_name: String,
	last_name: String,
	user_id: String,
	email: String,
	temp_password: String,
	password: String,
	instructor_courses: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Course'
	}],
	student_courses: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Course'
	}],
	user_orgs: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Organization'
	}],
	meetings: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Meeting'
	}],
	live_submissions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'LiveSubmission'
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
		default: false
	},
	is_instructor: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('User', User);