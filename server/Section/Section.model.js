const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Course = require('../Course/Course.model');
let User = require('../User/User.model');
let Meeting = require('../Meeting/Meeting.model');

//Define collection and schema for User
let Section = new Schema({
	section_number: Number,
	course: {
	  type: mongoose.Schema.Types.ObjectId,
	  ref: 'Course'
	},
	students: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	meetings: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Meeting'
	}],
	join_code: {type: String, required: true},
	has_open_enrollment: {type: Boolean, default: false},
	pending_approval_students: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	invited_students: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}]
});

module.exports = mongoose.model('Section', Section);
