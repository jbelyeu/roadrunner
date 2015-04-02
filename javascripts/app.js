var rrWebsiteApp = angular.module('rrWebsiteApp', ['map', 'sidebar', 'ngResource', 'ngGrid', 'ui.bootstrap']);

rrWebsiteApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	
	$routeProvider
	.when('Index', {
		templateUrl: 'home',
		controller: 'MainCtrl'
	});
}]);

