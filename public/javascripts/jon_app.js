function getCookie(key)
{
	console.log(document.cookie);
	cookies = document.cookie.split(';');
	console.log("cookies " + key);
	console.log(cookies);
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

.factory('userFactory', ['$http', function($http)
{
	var sessionUser = {
		firstname: 'default_first_name',
		lastname: 'default_last_name',
		username: 'default_username',
		password: 'default_password'
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
			}
		});		
	
	};

	sessionUser.saveNewUser = function(scope)
	{
		if (typeof scope.first_name == 'undefined' ||
			typeof scope.last_name == 'undefined' ||
			typeof scope.username == 'undefined' ||
			typeof scope.password == 'undefined' ||
			typeof scope.password_repeat == 'undefined' ||
			typeof scope.email == 'undefined' ||
			typeof scope.birth_day == 'undefined' ||
			typeof scope.birth_month == 'undefined' ||
			typeof $scope.birth_year == 'undefined' ||
			typeof scope.gender == 'undefined')
		{
			console.log("undefined param passed to signUpNewUser()");
			return;
		}
	
		if (scope.password != scope.password_repeat)
		{
			alert("Password does not match. Please re-enter");
			return;
		}
	
		var birthdateStr = scope.birth_year + " " + scope.birth_month + " " + scope.birth_day;
		var dateChecker = Date.parse(birthdateStr);

		if (isNaN(dateChecker))
		{
			alert("Birth date is invalid");
			return;
		}

		var birthDate = new Date(birthdateStr);
		var userObj = {
			first_name: scope.first_name,
			last_name: scope.last_name,
			username: scope.username,
			password: scope.password,
			email: scope.email,
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
			}
		});
	}

	return sessionUser;
}])

.factory('mainFactory', ['$http', function($http)
{
	var route = {
	};

	route.save = function(routeObj)
	{
		console.log("routeObj");
		console.log(routeObj);
	
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

		$.ajax({
			type: "POST",
			url: 'http://52.10.242.23/saveRoute/',
			data: routeObj,
			success: success
		});

		function success(data)
		{
			if (data == "Save Failed: User invalid")
			{
				alert('Save Failed. User invalid');
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
					"To avoid this message, log in before saving", "<username>");

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
		
		$http.get(url).success(function(data)
		{
			console.log(data);
		});
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
			console.log($scope);
			userFactory.saveNewUser($scope);
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
			var routename = 'another fine route';
			routename = routename.replace(/ /g, '_');
			console.log("routename: " + routename);
			mainFactory.loadRoutes(routename );
		};

	}
])

.controller('MainCtrl', 
[
	'$rootScope',
	'$scope',
	'$stateParams',
	'mainFactory', 
	'userFactory',
	function ($rootScope, $scope, $stateParams, mainFactory, userFactory)
	{
		$scope.load = function()
		{
		};

		$scope.saveChanges = function(userdata)
		{
			userFactory.saveNewUser($scope);
		};

	}
]);
