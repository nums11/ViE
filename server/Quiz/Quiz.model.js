const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const QuizQuestion = require('../QuizQuestion/QuizQuestion.model');
const Submission = require('../Submission/Submission.model');

//Define collection and schema for User
const Quiz = new Schema({
	questions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'QuizQuestion'
	}],
	submissions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Submission'
	}],
	is_open: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Quiz', Quiz);
