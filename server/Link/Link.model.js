const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Submission = require('../Submission/Submission.model');

const Link = new Schema({
	url: {
		type: String,
		required: true
	},
	submission: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Submission'
	}]
});

module.exports = mongoose.model('Link', Link);
