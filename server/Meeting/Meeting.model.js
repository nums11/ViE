const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LiveAttendance = require('../LiveAttendance/LiveAttendance.model');
let AsyncAttendance = require('../AsyncAttendance/AsyncAttendance.model');
let Course = require('../Course/Course.model');
let Organization = require('../Organization/Organization.model');

//Define collection and schema for User
let Meeting = new Schema({
	title: {
    type: String,
    required: true
  },
  start_time: {
    type: Date,
    required: true
  },
  end_time: {
    type: Date,
    required: true
  },
  for_course: {type: Boolean, default: false},
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  org: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  has_live_attendance: {type: Boolean, default: false},
  has_async_attendance: {type: Boolean, default: false},
  live_attendance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveAttendance',
    required: true
  },
  async_attendance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AsyncAttendance',
    required: true
  }, 
});

module.exports = mongoose.model('Meeting', Meeting);
