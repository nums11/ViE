const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RealTimePortion = require('../RealTimePortion/RealTimePortion.model');
let AsyncPortion = require('../AsyncPortion/AsyncPortion.model');
let Course = require('../Course/Course.model');

//Define collection and schema for User
let Meeting = new Schema({
	title: {
    type: String,
    required: true
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }],
  real_time_portion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RealTimePortion',
  },
  async_portion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AsyncPortion',
  }, 
});

// Todo - add pre validator that makes sure either real_time_portion or 
// async_portion is defined
// 

module.exports = mongoose.model('Meeting', Meeting);
