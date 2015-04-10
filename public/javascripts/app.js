angular.module('rrWebsiteApp',['ui.router', 'ngResource'])

.factory('loginFactory', ['$http', function($http)
{
	var login = {
	firstname: '',
		lastname: '',
		username: '',
		password: ''
	};

	login.signup = function(userData)
	{
		return $http.post('/signup/', userData).success(function(data)
		{
			if (data == "")
			{
				//it failed to save
			}
		});
	};

	login.validate = function(userData, callbackFun)
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
		});		
	
	};
	return login;

}])

.factory('mainFactory', ['$http', function($http)
{
	var route = {
		routes: [],
		data_stuff: 'asdf'
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

.factory('signUpFactory', ['$http', function($http)
{
	var user = {};

	return user;
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
	'$scope',
	'$stateParams',
	'loginFactory', 
	function ($scope, $stateParams, loginFactory)
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
			loginFactory.validate(user, function()
			{
				console.log("loserer");
				alert("Loser");
			});
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
			
			loginFactory.signup(newUser);
		};
	}
])
.controller('SignUpCtrl',
[
	'$scope',
	'$stateParams',
	'signUpFactory',
	function ($scope, $stateParams, signUpFactory)
	{
		$scope.signUpNewUser = function()
		{
			console.log("in the box");
			console.log($scope.first_name);
			console.log($scope.last_name);
			console.log($scope.username);
			console.log($scope.password);
			console.log($scope.password_repeat);
			console.log($scope.email);
			console.log($scope.birth_month);
			console.log($scope.birth_day);
			console.log($scope.birth_year);
			console.log($scope.gender);
		};
	}
])

.controller('MainCtrl', 
[
	'$scope',
	'$stateParams',
	'mainFactory', 
	function ($scope, $stateParams, mainFactory)
	{
		$scope.saveRoute = function(route, latitude, longitude, routename, username, password)
		{
			console.log("in saveRoute");
			console.log(route);
			console.log(latitude);
			console.log(longitude);
			console.log(routename);
			console.log(username);
			console.log(password);

			if (latitude == undefined ||
				longitude == undefined ||
				routename == undefined ||
				username == undefined ||
				password == undefined ||
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
				username: username,
				password: password,
				route: route
			};
			mainFactory.save(newRoute);i
		};
	}
]);
