const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Submission = require('../Submission/Submission.model');

//Define collection and schema for User
let QRScan = new Schema({
	code: {
		type: String,
		required: true
	}, 
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }]
});

module.exports = mongoose.model('QRScan', QRScan);
