const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = require('../User/User.model');
let Meeting = require('../Meeting/Meeting.model');

//Define collection and schema for User
let Organization = new Schema({
	name: String,
	board_members: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	general_members: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	meetings: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Meeting'
	}]
});

module.exports = mongoose.model('Organization', Organization);
