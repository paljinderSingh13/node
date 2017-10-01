app
	.config(function($stateProvider, $urlRouterProvider, $locationProvider){

		$locationProvider.html5Mode(true);

		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('/', {
				url : '/',
				templateUrl : 'admin/app/views/login.html',
				controller : 'adminLoginCtrl'
			})
			.state('master', {
				templateUrl : 'admin/app/views/layout/master.html',
			})
			.state('master.dashboard', {
				url : '/dashboard',
				templateUrl : 'admin/app/views/dashboard/dashboard.html',
				controller : 'adminCtrl'
			})
			.state('master.groups', {
				url : '/groups',
				templateUrl : 'admin/app/views/groups/groups.html',
				controller : 'adminCtrl'
			})
			.state('master.groupdetails', {
				url : '/groups/:groupId',
				templateUrl : 'admin/app/views/groups/viewGroup.html',
				controller : 'adminCtrl'
			})
			.state('master.institutes', {
				url : '/institutes',
				templateUrl : 'admin/app/views/institutes/institutes.html',
				controller : 'adminCtrl'
			})
			.state('master.instdetails', {
				url : '/institutes/:groupId',
				templateUrl : 'admin/app/views/institutes/viewInst.html',
				controller : 'adminCtrl'
			})
	})