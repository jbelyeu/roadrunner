angular.module('rrWebsiteApp',['ui.router', 'ngResource'])

.factory('userFactory', ['$http', function($http)
{
	var sessionUser = {
		firstname: 'default_first_name',
		lastname: 'default_last_name',
		username: 'default_username',
		password: 'default_password'
	};

	sessionUser.signup = function(userData)
	{
		return $http.post('/signup/', userData).success(function(data)
		{
			if (data == "")
			{
				//it failed to save
			}
		});
	};

	sessionUser.validate = function(userData, callbackFun)
	{
		console.log("in validate factory");
		console.log(userData);
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
				var name = data.toString();
				name = name.replace(/['"]+/g, "");
				alert("Welcome back, " + name + "!");
			}
		});		
	
	};

	sessionUser.getUsername = function()
	{
		return sessionUser.username;
	};

	sessionUser.getPassword = function()
	{
		return sessionUser.password;
	};

	sessionUser.saveNewUser = function(userObj)
	{
		console.log("in saveNewUser()");
		sessionUser.username = userObj.username;
		sessionUser.password = userObj.password;

		$http.post('/Signup', userObj).success(function(data)
		{
			console.log(data);
			if (data == "\"Username already exists\"")
			{
				alert("Username already exists!");
			}
			else
			{
				alert("You are now a member of RoadRunner!");
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
		console.log("trying to send post");
		
		$.ajax({
			type: "POST",
			url: 'http://52.10.242.23/saveRoute/',
			data: routeObj,
			success: success
		});

		function success(data)
		{
			console.log(data);
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

	route.loadRoutes = function(userData, callbackFun)
	{
		console.log("trying to call GET");

		var url = '/getRoutes/' + userData.username + '/' + userData.password;
		$http.get(url).success(function(data)
		{
			callbackFun(data);
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
			console.log("entering validate function");
			console.log($scope);
			if (typeof $scope.username === 'undefined' ||
				typeof $scope.password === 'undefined')
			{
				return;
			}
			var user = {
				username: $scope.username,
				password: $scope.password
			}
		
			console.log(user);
			userFactory.validate(user, function()
			{
				console.log("loserer");
				alert("Loser");
			});
			$rootScope.username = $scope.username;
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
			if (typeof $scope.first_name == 'undefined' ||
				typeof $scope.last_name == 'undefined' ||
				typeof $scope.username == 'undefined' ||
				typeof $scope.password == 'undefined' ||
				typeof $scope.password_repeat == 'undefined' ||
				typeof $scope.email == 'undefined' ||
				typeof $scope.birth_day == 'undefined' ||
				typeof $scope.birth_month == 'undefined' ||
				typeof $scope.birth_year == 'undefined' ||
				typeof $scope.gender == 'undefined')
			{
				console.log("undefined param passed to signUpNewUser()");
				return;
			}
		
			if ($scope.password != $scope.password_repeat)
			{
				alert("Password does not match. Please re-enter");
				return;
			}
		
			var birthdateStr = $scope.birth_year + " " + $scope.birth_month + " " + $scope.birth_day;
			console.log(birthdateStr);
			var dateChecker = Date.parse(birthdateStr);
	
			if (isNaN(dateChecker))
			{
				alert("Birth date is invalid");
				return;
			}

			var birthDate = new Date(birthdateStr);
			console.log(birthDate);
			var newUser = {
				first_name: $scope.first_name,
				last_name: $scope.last_name,
				username: $scope.username,
				password: $scope.password,
				email: $scope.email,
				birthdate: birthDate				
			};

			userFactory.saveNewUser(newUser);
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
		$scope.saveRoute = function(route, latitude, longitude, routename)
		{
			console.log("in saveRoute");
			console.log(route);
			console.log(latitude);
			console.log(longitude);
			console.log(routename);

			if (latitude == undefined ||
				longitude == undefined ||
				routename == undefined ||
				route == undefined 
			)
			{
				console.log("failed controller line 107");
				return;
			}

			//var username = userFactory.getUsername();
			//var password = userFactory.getPassword();

			console.log($rootScope.username);
			console.log("user^");

			var newRoute = {
				latitude: latitude,
				longitude: longitude,
				routename: routename,
	//			username: username,
	//			password: password,
				route: route
			};
			mainFactory.save(newRoute);
		};
	}
]);
