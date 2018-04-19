'use strict';

var mongoose = require('mongoose');
var ListSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	type: {
		type: String,
		required: true,
		trim: true
	},
	privacy: {
		type: String,
		required: true,
		trim: true
	},
	user: {
		type: Array,
		required: true
	},
	allowed: Array,
	items: Array,
	dateOfCreation: Number,
	dateOfChange: Number

});

var List = mongoose.model('List', ListSchema);
module.exports = List;