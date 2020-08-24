const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PollAnswers = new Schema({
	// Keys are object ids as strings and values are
	// array of strings that are the answers to the poll
	answers: {
	  type: Map,
	  of: [String]
	}
});

module.exports = mongoose.model('PollAnswers', PollAnswers);
