var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

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


//POST new user info
router.post('/signup', function(req, res, next) 
{
	console.log("in routes POST method");
	console.log(req.body);
	var user = new User(req.body);
	console.log(user);
	user.save(function (err, user)
	{
		if (err)
		{
			return next(err);
		}
		res.json(user);
	});
	
});
module.exports = router;
