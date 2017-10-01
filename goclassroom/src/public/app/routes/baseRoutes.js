app
	.config(function($stateProvider, $urlRouterProvider, $locationProvider){
		//$locationProvider.html5Mode(true)
		$stateProvider
			.state('/', {
				url : '/',
				controller 	: 'baseCtrl',
				templateUrl : 'public/app/views/base/login.html'
			})
			.state('404', {
				url : '/404',
				templateUrl : 'public/app/views/errors/404.html'
			})
			.state('register', {
		    	url : '/register',
		    	controller 	: 'baseCtrl',
		    	templateUrl : 'public/app/views/base/register.html'
		    })
		    .state('forgot', {
		    	url : '/forgot',
		    	templateUrl : 'public/app/views/base/forgotPassword.html',
		    })
		    .state('otp', {
		    	url : '/otp',
		    	controller 	: 'baseCtrl',
		    	templateUrl : 'public/app/views/base/otp.html'
		    })
		    .state('password', {
		    	url : '/password',
		    	controller 	: 'baseCtrl',
		    	templateUrl : 'public/app/views/base/setpassword.html'
		    })
		    .state('invite', {
		    	url : '/invite:invitationId',
		    	controller : 'invitationsCtrl',
		    	templateUrl : 'public/app/views/base/invitation.html'
		    })
		    .state('v', {
		    	url : '/v/:unid',
		    	controller : 'groupCtrl',
		    	templateUrl : 'public/app/view/base/viewGroup.html'
		    })
		    
		    $urlRouterProvider.otherwise('/');


	})