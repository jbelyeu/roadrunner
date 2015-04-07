var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema
({
	firstname:
	{
		type: String,
		required: true
	},
	lastname: 
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
