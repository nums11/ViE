const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = require('../User/User.model');
let Meeting = require('../Meeting/Meeting.model');

//Define collection and schema for User
let Course = new Schema({
	name: {
		type: String,
		required: true
	},
	dept: {
		type: String,
		required: true
	},
	course_number: {
		type: Number,
		required: true
	},
	instructor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	secondary_instructor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	students: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	meetings: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Meeting'
	}]
});

module.exports = mongoose.model('Course', Course);