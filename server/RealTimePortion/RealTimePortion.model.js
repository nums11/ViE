const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const QRScan = require('../QRScan/QRScan.model');
const Quiz = require('../Quiz/Quiz.model');

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
	quizzes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Quiz'
	}]
});

module.exports = mongoose.model('RealTimePortion', RealTimePortion);
