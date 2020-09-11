const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = require('../User/User.model');
let Meeting = require('../Meeting/Meeting.model');

//Define collection and schema for User
let Course = new Schema({
	name: String,
	dept: String,
	course_number: Number,
	instructor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
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