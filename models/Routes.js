var mongoose = require('mongoose');
var RouteSchema = new mongoose.Schema
({
	routename: String,
	username: String,
	latitude: String, //do we trust double for this?
	longitude: String,
	route: Array
});

RouteSchema.methods.create = function(obj) 
{
	console.log("in model function");
	console.log(obj.route);
	this.save(obj);
};

mongoose.model('Route', RouteSchema);
