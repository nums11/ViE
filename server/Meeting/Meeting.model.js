const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RealTimePortion = require('../RealTimePortion/RealTimePortion.model');
let AsyncAttendance = require('../AsyncAttendance/AsyncAttendance.model');
let Course = require('../Course/Course.model');

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
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }],
  real_time_portion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RealTimePortion',
    required: true
  },
  async_attendance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AsyncAttendance',
    required: true
  }, 
});

module.exports = mongoose.model('Meeting', Meeting);
