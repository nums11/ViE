const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Video = require('../Video/Video.model');
const Link = require('../Link/Link.model');

//Define collection and schema for User
const AsyncPortion = new Schema({
	async_start: {
	  type: Date,
	  required: true
	},
	async_end: {
	  type: Date,
	  required: true
	},
	videos: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Video'
	}],
	links: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Link'
	}]
});

module.exports = mongoose.model('AsyncPortion', AsyncPortion);
