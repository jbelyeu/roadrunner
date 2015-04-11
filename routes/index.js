var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Route = mongoose.model('Route');

	
/* GET home page. */
router.get('/', function(req, res, next) 
{
	res.render('index', { title: 'Express' });
});


//GET login page
router.get('/Account', function(req, res, next) 
{
	res.render('login', { title: 'Express' });
});

//GET signup page
router.get('/Signup', function(req, res, next)
{
	res.render('signup', { title: 'Express' });
});

//get all running routes for a given username
router.get('/getRoutes/:username/:pass', function(req, res, next) 
{
	console.log("stuff");
	console.log(req.params);
	var pass = req.params.pass;
	var user = req.params.username;

	var mongoClient = require("mongodb").MongoClient;
	mongoClient.connect('mongodb://localhost/roadrunner', function(err, db)
	{
		if (err) {throw err;}
		
		db.collection("users", function (err, users)
		{
			console.log("in call to db" + pass);
			if (err) {throw err;}
			
			users.find({password: pass, username: user}, function (err, items)
			{
				console.log("pass: " + pass);
				if (err) {throw err;}
				items.toArray(function (err, itemArray)
				{
					if (err) {throw err;}
					if (itemArray.length > 0) //means the user is valid
					{
						console.log("user valid");
						console.log(itemArray);
						Route.find({username: user}, function (err, routes)
						{
							if (err) {throw err;}
							console.log("routes found: ");
							console.log(routes);
							res.json(routes);
						});
					}
					else
					{
						res.json("Get Failed: User invalid");
					}
				});
			});
		});
	});

});

//POST new user info
router.post('/Signup', function(req, res, next) 
{
	console.log("in routes POST method");
	console.log(req.body);
	var user = new User(req.body);
	console.log(user);
	
	var mongoClient = require("mongodb").MongoClient;
	mongoClient.connect('mongodb://localhost/roadrunner', function(err, db)
	{
		if (err)	{ throw err; }
		
		db.collection("users", function (err, users)
		{
			console.log("in call to db: " + user.password);
			if (err) {throw err;}
			
			users.find({password: user.password, username: user.username}, function (err, items)
			{
				if (err) {throw err;}
				items.toArray(function (err, itemArray)
				{
					console.log("validating user");
					console.log(itemArray);

					if (err) {throw err;}
					if (itemArray.length > 0)
					{
						console.log("valid user");
						res.json("Username already exists");
					}
					else
					{
						user.save(function (err, user)
						{
							if (err)
							{
								return next(err);
							}
							res.json("User saved");
						});					
					}
				});
			});
		});
	});
});

//GET validate user
router.post('/validate', function(req, res, next) 
{
	console.log("in users validate POST method");
	console.log(req.body);
	var pass = req.body.password;
	var uname = req.body.username;
	
	var mongoClient = require("mongodb").MongoClient;
	mongoClient.connect('mongodb://localhost/roadrunner', function(err, db)
	{
		if (err)
		{
			throw err;
		}
		
		db.collection("users", function (err, users)
		{
			console.log("in call to db: " + pass);
			if (err) {throw err;}
			
			users.find({password: pass, username: uname}, function (err, items)
			{
				if (err) {throw err;}
				items.toArray(function (err, itemArray)
				{
					console.log("validating user");
					console.log(itemArray);

					if (err) {throw err;}
					if (itemArray.length > 0)
					{
						console.log("valid user");
						res.json(itemArray[0].first_name);
					}
					else
					{
						console.log("invalid user");
						res.json('Validation Failed: User invalid');
					}
				});
			});
		});
	});


});

//POST save route
router.post('/saveRoute', function(req, res, next)
{

	console.log("in saveRoute route");
	console.log(req.body);
	var body = req.body;
	var pass = body.password;
	delete body.password;
	var userValid = true;

	var mongoClient = require("mongodb").MongoClient;
	mongoClient.connect('mongodb://localhost/roadrunner', function(err, db)
	{
		if (err)
		{
			throw err;
		}
		
		db.collection("users", function (err, users)
		{
			console.log("in call to db: " + pass);
			if (err) {throw err;}
			
			users.find({password: pass, username: body.username}, function (err, items)
			{
				if (err) {throw err;}
				items.toArray(function (err, itemArray)
				{
					if (err) {throw err;}
					if (itemArray.length > 0)
					{
						console.log("valid user");
						var route = new Route(req.body);
						console.log('route');
						route.create(function (err, route)
						{
							console.log("in save");
							if (err)
							{
								console.log('err');
								return next(err);
							}
							res.json(route);
						});
					}
					else
					{
						console.log("invalid user");
						res.json("Save Failed: User invalid");
					}
				});
			});
		});
	});
});

module.exports = router;
