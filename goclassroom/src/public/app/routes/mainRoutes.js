app
	.config(function($stateProvider, $urlRouterProvider, $locationProvider){

		//$locationProvider.html5Mode(true)
		
		$stateProvider

		// user routes
			.state('user', {

				url : '/user',
				templateUrl : 'public/app/views/main/layout/master.html',

			})
			.state('user.profile', {

				url : '/profile',
				templateUrl : 'public/app/views/main/user/profile.html',
				controller : 'userCtrl',

			})
			.state('user.changepassword', {

				url : '/changepassword',
				templateUrl : 'public/app/views/main/user/changepassword.html',
				controller : 'userCtrl',

			})
		// dashobard routes
			.state('dashboard', {
				url : '/dashboard',
				templateUrl : 'public/app/views/main/layout/master.html',
			})
			.state('dashboard.home', {
				url : '/home',
				templateUrl : 'public/app/views/main/dashboard/dashboard.html',
				controller : 'dashboardCtrl'
			})

		// group routes
			.state('groups', {
				url : '/groups',
				templateUrl : 'public/app/views/main/layout/master.html',
			})
			.state('groups.list', {
				url : '/list',
				templateUrl : 'public/app/views/main/groups/listGroups.html',
				controller : 'groupsCtrl'
			})
			.state('groups.add', {
				url : '/add',
				templateUrl : 'public/app/views/main/groups/addGroups.html',
				controller : 'groupsCtrl'
			})
			.state('groups.details', {
				url : '/details/:groupId',
				templateUrl : 'public/app/views/main/groups/viewGroup.html',
				controller : 'groupsCtrl'
			})
			.state('groups.edit', {
				url : '/edit/:groupId',
				templateUrl : 'public/app/views/main/groups/editGroup.html',
				controller : 'groupsCtrl'
			})
			
		// classes routes
			.state('classes', {
				url : '/classes',
				templateUrl : 'public/app/views/main/layout/master.html',
			})
			.state('classes.add', {
				url : '/add',
				templateUrl : 'public/app/views/main/classes/addSubject.html',
				controller : 'subjectCtrl'
			})
			.state('classes.list', {
				url : '/list',
				templateUrl : 'public/app/views/main/classes/listSubject.html',
				controller : 'subjectCtrl'
			})
			.state('classes.details', {
				url : '/details/:subjectId',
				templateUrl : 'public/app/views/main/classes/viewSubject.html',
				controller : 'subjectCtrl'
			})
			.state('classes.edit', {
				url : '/edit/:subjectId',
				templateUrl : 'public/app/views/main/classes/editSubject.html',
				controller : 'subjectCtrl'
			})

		// section routes
			.state('sections', {
				url : '/sections',
				templateUrl : 'public/app/views/main/layout/master.html',
			})
			.state('sections.list', {
				url : '/list',
				templateUrl : 'public/app/views/main/sections/listClasses.html',
				controller : 'classesCtrl'
			})
			.state('sections.add', {
				url : '/add',
				templateUrl : 'public/app/views/main/sections/addClass.html',
				controller : 'classesCtrl'
			})
			.state('sections.details', {
				url : '/details/:classId',
				templateUrl : 'public/app/views/main/sections/viewClass.html',
				controller : 'classesCtrl'
			})
			.state('sections.edit', {
				url : '/edit/:classId',
				templateUrl : 'public/app/views/main/sections/editClasses.html',
				controller : 'classesCtrl'
			})

		// invitations routes
			.state('invitations', {
				url : '/invitations',
				templateUrl : 'public/app/views/main/layout/master.html',
			})
			.state('invitations.list', {
				url : '/list',
				templateUrl : 'public/app/views/main/invitations/listInvitations.html',
				controller : 'invitationsCtrl'
			})
			.state('invitations.add', {
				url : '/add',
				templateUrl : 'public/app/views/main/invitations/addInvitations.html',
				controller : 'invitationsCtrl'
			})
			.state('master' , {
				templateUrl: 'public/app/views/main/layout/master.html'
				
			})
			.state('master.chat', {
				url : '/chat',
				views: {
		           	'users@master.chat':{
		           		templateUrl:"public/chat/views/user-list.html"
		           	},
		           	'chat-messages@master.chat':{
		           		templateUrl:"public/chat/views/chat-messages.html"
		           	},
		           	'chat-footer@master.chat':{
		           		templateUrl:"public/chat/views/chat-footer.html",
						controller: 'chatEmoji'
		           	},
		           	'chat@master':{
		           		templateUrl:"public/chat/chat-wrapper.html",
		           		controller:"chatController"
		           	}
		           	
		       	}
		       	
			})
	
	})
