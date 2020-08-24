const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let QRCheckin = require('../QRCheckin/QRCheckin.model');
let Poll = require('../Poll/Poll.model');

//Define collection and schema for User
let LiveAttendance = new Schema({
	qr_checkins: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'QRCheckin'
	}],
  live_polls: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll'
  }]
});

module.exports = mongoose.model('LiveAttendance', LiveAttendance);
