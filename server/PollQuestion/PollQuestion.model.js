const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PollQuestion = new Schema({
	question: String,
	answer_choices: [String],
	correct_answers: [String]
});

module.exports = mongoose.model('PollQuestion', PollQuestion);
