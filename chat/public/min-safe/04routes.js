angular.module('kosmochat')
.config(['$stateProvider', '$urlRouterProvider', '$cookiesProvider', function($stateProvider,$urlRouterProvider,$cookiesProvider){
	// for unmatched urls
	//$urlRouterProvider.otherwise('/home');
	// states
	$stateProvider.state('chat',{
		url:'/chat',
		templateUrl:'views/chat.html',
		controller:'ChatCtrl'
	})
	.state('chat.connect',{
		views:{
			'chatHeads':{
				templateUrl:'modules/chat/views/chat-heads.html'
			},
			'messages':{
				templateUrl:'modules/chat/views/chat-messages.html'
			}
		}
	})
	.state('chat.notFound',{
		views:{
			'messages':{
				templateUrl:'modules/chat/views/not-found-partner.html'
			}
		}
	})
	.state('chat.connect.end',{
		templateUrl:'modules/chat/views/chat-end.html',
		controller:'ChatEndCtrl'
	})
	.state('chat.connect.reportend',{
		templateUrl:'modules/chat/views/chat-end-report.html',
		controller:'ChatEndCtrl'
	});
	// video chat
	$stateProvider.state('videoChat',{
		url:'/videoChat',
		templateUrl:'views/videoChat.html',
		controller:'VideoChatCtrl'
	})
	.state('videoChat.connect',{
		views:{
			'chatHeads':{
				templateUrl:'modules/chat/views/chat-heads.html'
			},
			'messages':{
				templateUrl:'modules/chat/views/chat-messages.html'
			}
		}
	})

	.state('videoChat.notFound',{
		views:{
			'messages':{
				templateUrl:'modules/chat/views/not-found-partner.html'
			}
		}
	})
	
	.state('videoChat.connect.end',{
		templateUrl:'modules/chat/views/chat-end.html',
		controller:'ChatEndCtrl'
	})
	.state('videoChat.connect.reportend',{
		templateUrl:'modules/chat/views/chat-end-report.html',
		controller:'ChatEndCtrl'
	});
	
}]);