const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PollQuestion = new Schema({
	question: String,
	answer_choices: [String],
	correct_answers: [String],
	recording_timestamp: {
		type: Number,
		default: 0
	},
});

module.exports = mongoose.model('PollQuestion', PollQuestion);
