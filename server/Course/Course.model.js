const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = require('../User/User.model');
let Meeting = require('../Meeting/Meeting.model');
let Section = require('../Section/Section.model');

//Define collection and schema for User
let Course = new Schema({
	name: {
		type: String,
		required: true
	},
	// Change to subject code
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
	sections: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Section'
	}],
});

module.exports = mongoose.model('Course', Course);