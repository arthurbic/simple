'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var UserSchema = new mongoose.Schema({
	
 local            : {
        email            : {type: String,trim: true},
        password         : {type: String},
        forgotPwdToken   : {type: String}, 
        activated        : {type: Boolean},
        activationToken : {type: String}
 },
 facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        friends		 : Array
 },
 google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
 },
 	location: {
 		type: Object
 	},
	displayName: {
		type: String,
		trim: true
	},
	first_name: {
		type: String,
		trim: true		
	},
	last_name: {
		type: String,
		trim: true		
	},
	pictureUrl: {
		type: String,
		trim: true
	},
	lists:  {
		type: Array,
		required: false
	},
	isAdmin: {
		type: Boolean
	},
	followers: Array,
	following: Array,
	chats: Array,
	signup: Boolean,
	notifications: Array
});



//hash password
var salt=bcrypt.genSaltSync(10);
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, salt, null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

var User = mongoose.model('User', UserSchema);
module.exports = User;