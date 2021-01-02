const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizQuestion = new Schema({
	question: {
		type: String,
		required: true
	},
	answer_choices: [{
		type: String
	}],
	correct_answer: {
		type: Number,
		required: true
	},
	video_timestamp: {
		type: Number
	}
});

module.exports = mongoose.model('QuizQuestion', QuizQuestion);
