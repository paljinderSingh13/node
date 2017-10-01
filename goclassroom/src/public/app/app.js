var app =
	angular
		.module('goclassrooms', ['ui.router', 'ngMaterial', 'ngMessages', 'md.data.table', 'angular-jwt', 'angular-loading-bar', 'ngAnimate', 'chat', 'am.date-picker'])
		.config(function($mdThemingProvider, $httpProvider, cfpLoadingBarProvider, amDatePickerConfigProvider) {

			// material theme configurations
		  	$mdThemingProvider.theme('default')
		    	.primaryPalette('green')
		    	.accentPalette('orange');

		    // hiding loading circle
		    cfpLoadingBarProvider.includeSpinner = false;
			
			// changing headers to json for delete requests
			$httpProvider.defaults.headers.delete = { "Content-Type": "application/json;charset=utf-8" };

			amDatePickerConfigProvider.setOptions({
	            calendarIcon: 'lib/angular-material-date-picker/dist/images/icons/ic_today_24px.svg',
	            clearIcon: 'lib/angular-material-date-picker/dist/images/icons/ic_close_24px.svg',
	            nextIcon: 'lib/angular-material-date-picker/dist/images/icons/ic_chevron_right_18px.svg',
	            prevIcon: 'lib/angular-material-date-picker/dist/images/icons/ic_chevron_left_18px.svg'
	        })
		})
		.run(['$http','$rootScope', '$window', 'jwtHelper', '$location', 
			function ($http, $rootScope, $window, jwtHelper, $location) {
					
				$rootScope.SITE_URL = $location.protocol() + "://" + location.host;

				var token = $window.localStorage.ud_classrooms;
				
				if(token != undefined && token != 'null'){

			 		$rootScope.user = jwtHelper.decodeToken(token);

					$http.defaults.headers.common.Authorization = token;

				} 
		}])		