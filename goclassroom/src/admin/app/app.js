var app = 
	angular
		.module('admin', ['ngMaterial','ui.router', 'angular-loading-bar', 'angular-jwt', 'md.data.table'])
		.config(function($mdThemingProvider, cfpLoadingBarProvider) {

			// material theme configurations
		  	$mdThemingProvider.theme('default')
		    	.primaryPalette('green')
		    	.accentPalette('orange');

		    // hiding loading circle
		    cfpLoadingBarProvider.includeSpinner = false;

		})
		.run(['$rootScope', '$window', 'jwtHelper', '$http', '$state',
			function ($rootScope, $window, jwtHelper, $http, $state) {
				
				$rootScope.currentNavItem = 'dashboard';

				var token = $window.localStorage.ud_ad_classrooms;

				if(token != undefined && token != 'null'){

			 		$rootScope.user = jwtHelper.decodeToken(token);

					$http.defaults.headers.common.Authorization = token;

				}

		}])