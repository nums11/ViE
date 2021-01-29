const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Submission = require('../Submission/Submission.model');
const Quiz = require('../Quiz/Quiz.model');

//Define collection and schema for User
const Video = new Schema({
	name: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	quiz: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Quiz'
	},
	submissions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Submission'
	}],
	allow_unrestricted_viewing_for_real_time_submitters: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Video', Video);
