const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let QRScan = require('../QRScan/QRScan.model');
// let Poll = require('../Poll/Poll.model');

//Define collection and schema for User
let RealTimePortion = new Schema({
	real_time_start: {
	  type: Date,
	  required: true
	},
	real_time_end: {
	  type: Date,
	  required: true
	},
	qr_scans: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'QRScan'
	}],
  // live_polls: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Poll'
  // }]
});

module.exports = mongoose.model('RealTimePortion', RealTimePortion);
