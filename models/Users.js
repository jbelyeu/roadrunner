var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema
({
	first_name:
	{
		type: String,
		required: true
	},
	last_name: 
	{
		type: String,
		required: true
	},
	username:
	{
		type: String,
		required: true,
		index: true,
		unique: true
	},
	password: 
	{
		type: String,
		required: true
	},
	email:
	{
		type: String,
		required: false
	},
	birthdate:
	{
		type: Date,
		required: true
	}
},
{
	strict: true
});

UserSchema.methods.createNew = function(data)
{
	this.save(data);
};
mongoose.model("User", UserSchema);
