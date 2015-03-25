var express = require('express');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth-connect');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var app = express();
app.use('/', express.static('./html', {maxAge: 60*60*1000}));
app.use(bodyParser());
var mongoClient = require ("mongodb").MongoClient;


var auth = basicAuth(function(user, pass) 
{
	return((user ==='cs360')&&(pass === 'test'));
});

var options = 
{
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.get('/', function (req, res) 
{
	res.send("Get Index");
});

app.get('/getRoute', function (req, res) 
{
    console.log("In getRoute route");
	
	var queryStr = req.query['num'];
	//var queryRe = new RegExp("^" + queryStr, 'i');
	//will need to read the data out of the string
	//data will include: user location, number of turns

	var cgiProcess = require("child_process");
	var command = "mono html/helloWorld.exe " + queryStr;

	cgiProcess.exec(command, function(error, stdout, stderror)
	{
		var result = stdout;
		console.log("prison break");
		console.log(command);
		console.log(result);
		res.json(result);
	});
});

app.get('/route', function (req, res)
{
	console.log("In POST route route");
	mongoClient.connect("mongodb://localhost/routes", function(err, db) 
	{
		if (err) throw err;

		db.collection("routes", function (err, comments)
		{
			if (err) throw err;
			comments.find(function (err, items)
			{
				items.toArray(function (err, itemArray)
				{
					res.json(itemArray);
				});
			});
		});
	});
});

app.post("/comment", auth, function (req, res)
{
	console.log("In post body comment route");
	console.log(req.body);
	console.log(req.body.Name);
	console.log(req.body.Comment);

	var reqObj = req.body
	mongoClient.connect("mongodb://localhost/comments", function(err, db) 
	{
		if (err) throw err;

		db.collection('comments').insert(reqObj, function(err, records)
		{
			console.log(reqObj);
			console.log("Record added as "+records[0]._id);
		});
	});

	res.status(200);
	res.end();
});
