const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LiveSubmission = require('../LiveSubmission/LiveSubmission.model');

//Define collection and schema for User
let QRCheckin = new Schema({
	code: String,
  qr_checkin_start_time: Date,
  qr_checkin_end_time: Date,
  qr_checkin_submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveSubmission'
  }]
});

module.exports = mongoose.model('QRCheckin', QRCheckin);
