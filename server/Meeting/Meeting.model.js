const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = require('../User/User.model');
let Section = require('../Section/Section.model');
let Organization = require('../Organization/Organization.model');
let LiveAttendance = require('../LiveAttendance/LiveAttendance.model');
let AsyncAttendance = require('../AsyncAttendance/AsyncAttendance.model');

//Define collection and schema for User
let Meeting = new Schema({
	title: String,
	sections: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Section'
	}],
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  start_time: Date,
  end_time: Date,
  has_live_attendance: {type: Boolean, default: false},
  has_async_attendance: {type: Boolean, default: false},
  live_attendance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveAttendance'
  },
  async_attendance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AsyncAttendance'
  }, 
});

module.exports = mongoose.model('Meeting', Meeting);
