const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Recording = require('../Recording/Recording.model');
// Coming Soon
// let File = require('../File/File.model');
// let Link = require('../Link/Link.model');

//Define collection and schema for User
let AsyncAttendance = new Schema({
	recordings: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Recording'
	}],
});

module.exports = mongoose.model('AsyncAttendance', AsyncAttendance);
