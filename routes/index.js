var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Route = mongoose.model('Route');
var cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());

/*   !!!!! NOTE !!!!! 
 *   Account should depend on cookies 
 *   */

	
/* GET home page. */
router.get('/', function(req, res, next) 
{
	res.render('index', { title: 'Express' });
});

// GET about us page
router.get('/AboutUs', function(req, res, next) 
{
	res.render('aboutus', { title: 'Express' });
});

// GET contact page
router.get('/Contact', function(req, res, next) 
{
	res.render('contact', { title: 'Express' });
});

//GET account page
router.get('/Account', function(req, res, next) 
{
	console.log(req.cookies.username == undefined);
	if (req.cookies.username == undefined)
		res.render('login', { title: 'Express' });
	else
		res.render('account', { title: 'Express' });
});

//GET signup page
router.get('/Signup', function(req, res, next)
{
	res.render('signup', { title: 'Express' });
});

//get all running routes for a given username or one route if routename is given
router.get('/getRoutes/:username/:pass/:routename', function(req, res, next) 
{
	var pass = req.params.pass;
	var user = req.params.username;
	var routename = req.params.routename;

	var mongoClient = require("mongodb").MongoClient;
	mongoClient.connect('mongodb://localhost/roadrunner', function(err, db)
	{
		if (err) {throw err;}
		
		db.collection("users", function (err, users)
		{
			if (err) {throw err;}
			var searchTerm = {password: pass, username: user};
			
			users.find(searchTerm, function (err, items)
			{
				if (err) {throw err;}
				items.toArray(function (err, itemArray)
				{
					if (err) {throw err;}
					if (itemArray.length > 0) //means the user is valid
					{
						searchTerm = {username: user};

						if (routename != "null" ) 
						{
							routename = routename.replace(/_/g, ' ');
							searchTerm['routename'] = routename;
						}
						Route.find(searchTerm, function (err, routes)
						{
							if (err) {throw err;}
							res.json(routes);
						});
					}
					else
					{
						res.json("GET failed: User invalid or no routes found for user");
					}
				});
			});
		});
	});

});

//POST new user info
router.post('/Signup', function(req, res, next) 
{
	var user = new User(req.body);
	
	var mongoClient = require("mongodb").MongoClient;
	mongoClient.connect('mongodb://localhost/roadrunner', function(err, db)
	{
		if (err)	{ throw err; }
		
		db.collection("users", function (err, users)
		{
			if (err) {throw err;}
			
			users.find({password: user.password, username: user.username}, function (err, items)
			{
				if (err) {throw err;}
				items.toArray(function (err, itemArray)
				{
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

//POST validate user
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

//POST get user data
router.post('/GetUserData', function(req, res, next) 
{
	console.log("in users getUserData POST method");
	console.log(req.body);
	var pass = req.body.password;
	var uname = req.body.username;
	
	var mongoClient = require("mongodb").MongoClient;
	mongoClient.connect('mongodb://localhost/roadrunner', function(err, db)
	{
		if (err) {throw err;}
		
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
						res.json({firstname: itemArray[0].first_name, 
									lastname: itemArray[0].last_name,
									birthdate: itemArray[0].birthdate});
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
	var body = req.body;
	var routeArr = [];
	var latitude = '', longitude = '';

	for (var key in body)
	{
		if (key.indexOf("[lat]") != -1)
		{
			console.log("here");
			latitude = body[key];
			delete body[key];
		}
		else if (key.indexOf("[lng]") != -1 )
		{
			longitude = body[key];
			delete body[key];
		}

		if (latitude != '' && longitude != '')
		{
			var pair = {
				lat: latitude,
				lng: longitude
			};
			routeArr.push(pair);

			latitude = '';
			longitude = '';
		}

	}
	body.route = routeArr;
	var pass = body.password;
	delete body.password;
	var userValid = true;

	var mongoClient = require("mongodb").MongoClient;
	mongoClient.connect('mongodb://localhost/roadrunner', function(err, db)
	{
		if (err) { throw err; }
		
		db.collection("users", function (err, users)
		{
			if (err) {throw err;}

			//make sure user is valid
			users.find({password: pass, username: body.username}, function (err, items)
			{
				if (err) {throw err;}
				items.toArray(function (err, itemArray)
				{
					if (err) {throw err;}
					if (itemArray.length <= 0)
					{
			
						res.json("Save Failed: User invalid");
					}
					//make sure the routename is unique
					db.collection("routes", function(err, routes)
					{
						routes.find({username: body.username, routename: body.routename}, function (err, routesFound)
						{
							if (err) {throw err};
							routesFound.toArray (function (err, routeArr)
							{
								console.log("arr");
								console.log(routeArr);
								if (routeArr.length > 0)
								{
									console.log("what the shiz?");
									res.json("Save Failed: Routename already in use. Please choose another");
								}
								else
								{
									var route = new Route(req.body);
									route.create(function (err, route)
									{
										if (err)
										{
											res.json("Save Failed: Unknown error");
											return next(err);
										}
									});
								}
							});
						});
					});
				});
			});
		});
	});
});

module.exports = router;
