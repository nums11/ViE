const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Course = require('../Course/Course.model');
let Section = require('../Section/Section.model');

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
	},
	ta_sections: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Section'
	}],
});

module.exports = mongoose.model('User', User);