const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = require('../User/User.model');
let Section = require('../Section/Section.model');
let Organization = require('../Organization/Organization.model');


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
  has_async_attendance: {type: Boolean, default: false}
});

module.exports = mongoose.model('Meeting', Meeting);
