function getCookie(key)
{
	if (document.cookie.indexOf(key) == -1)
	{
		return;
	}
	cookies = document.cookie.split(';');
	for (var i = 0; i < cookies.length; ++i)
	{
		var cookie = cookies[i];
		while (cookie.charAt(0) == ' ') 
		{
			cookie = cookie.substring(1); //apparently cookies have to be stripped
		}
		var pair = cookie.split('=');
		if (pair[0] == key)
		{
			return pair[1];
		}
	}
}

function putCookie(key, value)
{
	var expireTime = new Date();
	expireTime.setTime(expireTime.getTime() + ( 60 * 60 * 1000));
	var expires = "expires=" + expireTime.toUTCString();
	document.cookie = key + "=" + value + ";" + expires;
}

angular.module('rrWebsiteApp',['ui.router', 'ngResource'])

.factory('userFactory', ['$http', '$window', function($http, $window) //Added $window by Artem to route back to the homepage
{
	var sessionUser = {
		firstname: 'default_first_name',
		lastname: 'default_last_name',
		username: 'default_username',
		password: 'default_password',
		birthdate: ''
	};

	sessionUser.validate = function(userData)
	{
		$http.post('/validate/', userData).success(function(data)
		{
			var errMsg = "\"Validation Failed: User invalid\"";

			//it failed to validate
			if (data == errMsg)
			{
				alert("Failed to sign in. Double check your username and password");
			}
			else
			{
				putCookie("username", userData.username);
				putCookie("password", userData.password);
				var name = data.toString();
				name = name.replace(/['"]+/g, "");
				alert("Welcome back, " + name + "!");
				$window.location.href = '/'; //Redirects back to the main page
			}
		});		
	
	};

	sessionUser.getUserData = function(callback)
	{
		var username = getCookie("username");
		var password = getCookie("password");

		if (typeof username == "undefined" ||
			typeof password == "undefined" )
		{
			username = prompt("It appears that your session has expired. " +
					"Please enter your username and password to load. " );

			if ( username == null || username == "<username>")
			{
				return; //if they don't input a username, we don't prompt for a password
			}
			password = prompt("Password", "<password>");
		}

		var params = {
			username: username,
			password: password
		};

		$http.post('/GetUserData/', params).success(callback);
	};

	sessionUser.saveNewUser = function (first_name, last_name, username, 
		password, password_repeat, email, birth_day, birth_month, birth_year, gender)
	{
		if (typeof first_name == 'undefined' ||
			typeof last_name == 'undefined' ||
			typeof username == 'undefined' ||
			typeof password == 'undefined' ||
			typeof password_repeat == 'undefined' ||
			typeof email == 'undefined' ||
			typeof birth_day == 'undefined' ||
			typeof birth_month == 'undefined' ||
			typeof birth_year == 'undefined' ||
			typeof gender == 'undefined')
		{
			console.log("undefined param passed to signUpNewUser()");
			return;
		}
	
		if (password != password_repeat)
		{
			alert("Password does not match. Please re-enter");
			return;
		}
	
		var birthdateStr = birth_year + " " + birth_month + " " + birth_day;
		var dateChecker = Date.parse(birthdateStr);

		if (isNaN(dateChecker))
		{
			alert("Birth date is invalid");
			return;
		}

		var birthDate = new Date(birthdateStr);
		var userObj = {
			first_name: first_name,
			last_name: last_name,
			username: username,
			password: password,
			email: email,
			birthdate: birthDate				
		};

		sessionUser.username = userObj.username;
		sessionUser.password = userObj.password;

		$http.post('/Signup', userObj).success(function(data)
		{
			if (data == "\"Username already exists\"")
			{
				alert("Username already exists!");
			}
			else
			{
				alert("You are now a member of RoadRunner!");

				putCookie("username", userObj.username);
				putCookie("password", userObj.password);

				$window.location.href = '/'; // Redirects back to the home page
			}
		});
	}

	return sessionUser;
}])

.factory('mainFactory', ['$http', function($http)
{
	var route = {
		routes: [],
		route: {}
	};

	route.save = function(routeObj)
	{
		var username = getCookie("username");
		var password = getCookie("password");

		if (typeof username == "undefined" ||
			typeof password == "undefined" )
		{
			username = prompt("Enter your username and password to save. " +
					"To avoid this message, log in before saving", "<username>");

			if ( username == null || username == "<username>")
			{
				return; //if they don't input a username, we don't prompt for a password
			}
			password = prompt("Password", "Password");
			
		}
		routeObj.username = username;
		routeObj.password = password;

		$.ajax(
		{
			type: "POST",
			url: 'http://52.10.242.23/saveRoute/',
			data: routeObj,
			success: success
		});

		function success(data)
		{
			var failedMsg = "Save Failed: ";
			if (data.indexOf( failedMsg) != -1 )
			{
				alert(data);
			}
			else
			{
				alert("Save succeeded");
			}	
		}
	}

	route.loadRoutes = function(routename)
	{
		var username = getCookie("username");
		var password = getCookie("password");

		if (typeof username == "undefined" ||
			typeof password == "undefined" )
		{
			username = prompt("Enter your username and password to load route. " + 
					"To avoid this message, log in before loading", "<username>");

			if ( username == null || username == "<username>")
			{
				return; //if they don't input a username, we don't prompt for a password
			}
			password = prompt("Password", "<password>");
		}

		if (typeof routename == 'undefined' || routename == "")
		{
			routename = 'null';
		}

		var url = '/getRoutes/' + username + '/' + password + '/' + routename;
	
		if (routename == 'null')
		{
			return $http.get(url).success(function(data)
			{
				var routenames = [];
				for (var i = 0; i < data.length; ++i)
				{
					routenames.push(data[i].routename);
				}
				angular.copy(routenames, route.routes);
			});
		}
		else
		{
			var xmlHttp = null;

			xmlHttp = new XMLHttpRequest();
			xmlHttp.open("GET", 'http://52.10.242.23' + url, false);
			xmlHttp.send(null);
			return xmlHttp.responseText;
		}	
	}

	return route;
}])

.config
([
	'$stateProvider',
	'$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) 
	{
		$stateProvider
		.state('home', 
		{
			url: '/home',
			templateUrl: '/index.ejs',
			controller: 'MainCtrl'
		})
		.state("Login",
		{
			url: '/Login',
			templateUrl: '/login',
			controller: 'LoginCtrl'
		})
		.state("saveRoute",
		{
			url: '/SaveRoute',
			templateUrl: '/saveRoute',
			controller: 'MainCtrl'
		})
		.state("SignUp",
		{
			url: '/SignUp',
			templateUrl: '/signUp',
			controller: 'SignUpCtrl'
		});
		$urlRouterProvider.otherwise('home');
	}
])

.controller('LoginCtrl',
[
	'$rootScope',
	'$scope',
	'$stateParams',
	'userFactory', 
	function ($rootScope, $scope, $stateParams, userFactory)
	{
		$scope.validateUser = function()
		{
			if (typeof $scope.username === 'undefined' ||
				typeof $scope.password === 'undefined')
			{
				return;
			}
			var user = {
				username: $scope.username,
				password: $scope.password
			}
		
			userFactory.validate(user);
			
		};
		
		$scope.addNewUser = function()
		{
			if (typeof $scope.firstname  === 'undefined' || 
				typeof $scope.lastname  === 'undefined' ||
				typeof $scope.username  === 'undefined' ||
				typeof $scope.password  === 'undefined') 
			{
				return;
			}
			var newUser = { 
                firstname: $scope.firstname,
                lastname: $scope.lastname,
                username: $scope.username,
                password: $scope.password
            };
			
			userFactory.signup(newUser);
		};
	}
])
.controller('SignUpCtrl',
[
	'$scope',
	'$stateParams',
	'userFactory',
	function ($scope, $stateParams, userFactory)
	{
		$scope.signUpNewUser = function()
		{
			userFactory.saveNewUser($scope.first_name, $scope.last_name,
				$scope.username, $scope.password, $scope.password_repeat, 
				$scope.email, $scope.birth_day, $scope.birth_month, 
				$scope.birth_year, $scope.gender);
		};
	}
])

.controller('MainCtrl', 
[
	'$rootScope',
	'$scope',
	'$stateParams',
	'mainFactory', 
	function ($rootScope, $scope, $stateParams, mainFactory)
	{
		$scope.route = 'unset';
		$scope.latitude = 'unset';
		$scope.longitude = 'unset';
		

		$scope.saveRoute = function(route, latitude, longitude)
		{
			var routename = prompt("Please enter a name for your route", "<name>");

			if (latitude == undefined ||
				longitude == undefined ||
				routename == undefined ||
				route == undefined 
			)
			{
				console.log("failed controller line 107");
				return;
			}
			var newRoute = {
				latitude: latitude,
				longitude: longitude,
				routename: routename,
				route: route
			};
			mainFactory.save(newRoute);
		};

		$scope.loadRoute = function()
		{
			var routename = getCookie("chosenroute");
			console.log("fish");
			console.log(routename);
			if (typeof routename == "undefined")
			{
				routename = prompt("Please enter name of desired route or go to Account page to load route");
				if (routename == null) //still didn't choose one
				{
					return;
				}
			}
			routename = routename.replace(/ /g, '_');

			var data = mainFactory.loadRoutes(routename);
			var info = eval ( "(" + data  + ")" );

			var parsedData = {
				route: info[0].route,
				latitude: info[0].latitude,
				longitude: info[0].longitude,
			}

			return parsedData;
		};

	}
])

// This is the controller defined by Artem
.controller('AccCtrl',
[
	'$scope', 
	'mainFactory', 
	'userFactory',
	function($scope, mainFactory, userFactory) 
	{
		mainFactory.loadRoutes();
		$scope.routes = mainFactory.routes;
		userFactory.getUserData( function (data)
		{
			$scope.name = data.firstname + " " + data.lastname;
			var today = new Date();
			var birthdate = new Date(data.birthdate);
			
			var age = today.getFullYear() - birthdate.getFullYear();
			if (today.getMonth() < birthdate.getMonth - 1)
			{
				age --;
			}
			if (birthdate.getMonth -1 == today.getMonth() && today.getDay() < birthdate.getDay())
			{
				age--;
			}
			$scope.age = age;
		});
		
		$scope.routeClick = function(position) 
		{			
			var routename = mainFactory.routes[position];
			putCookie("chosenroute", routename);
		}
}])
