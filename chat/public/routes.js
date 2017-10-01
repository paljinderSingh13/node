angular.module('kosmochat').config(function($stateProvider,$urlRouterProvider,$cookiesProvider){
	// for unmatched urls
	$urlRouterProvider.otherwise('/home');
	// states
	$stateProvider.state('home',{
		url:'/home',
		templateUrl:'views/home.html',
		controller:'HomeCtrl'
	})
	.state('filter',{
		url:'/filters',
		templateUrl:'views/filter.html',
		controller:'FilterCtrl'
	})
	.state('filter.world',{
		url:'/world',
		templateUrl:'views/filters/filter-world.html',
		controller:'FilterCtrl'
	})
	.state('filter.country',{
		url:'/country',
		templateUrl:'views/filters/filter-country.html',
		controller:'FilterCtrl'
	})
	.state('filter.nearby',{
		url:'/nearby',
		templateUrl:'views/filters/filter-nearby.html',
		controller:'FilterCtrl'
	})
	.state('privacy',{
		url:'/privacy',
		templateUrl:'views/privacy-policy.html'
	})
	.state('contact',{
		url:'/contact',
		templateUrl:'views/contact.html'
	})
	.state('feedback',{
		url:'/feedback',
		templateUrl:'views/feedback.html',
		controller:'feedbackController'
	})
	.state('sharingPhoto',{
		url:'/sharingPhoto',
		templateUrl:'views/sharing-photo.html'
	})
	.state('terms',{
		url:'/terms',
		templateUrl:'views/terms-condition.html'
	})	
	// admin routes
	.state('login',{
		url:'/login',
		templateUrl:'views/admin/login.html',
		controller: "loginController",
		resolve : {
			loggedIn : function(authAdmin,$window){
				if(authAdmin.isAdmin() == 'true'){
					$window.location.href= '#/admin';
				}
				else{
					return true;
				}
			},
			getUsers : function(){
				return null;
			}
		}
	})
	.state('admin',{
		url:'/admin',
		templateUrl:'views/admin/dashboard.html',
		controller: "adminController",
		resolve : {
			loggedIn : function(authAdmin){
				return authAdmin.isAdmin();
			}
		}
	})

	.state('blockedUsers',{
		url:'/admin',
		templateUrl:'views/admin/blockedUsers.html',
		controller: "adminController",
		resolve : {
			loggedIn : function(authAdmin){
				return authAdmin.isAdmin();
			}
		}
	})
	//to create user first time
	.state('register',{
		url:'/register',
		templateUrl:'views/admin/register.html',
		controller: "adminController",
		resolve : {
			loggedIn : function(authAdmin){
				return true
			},
			getUsers : function(){
				return null;
			}
		}
	});
})