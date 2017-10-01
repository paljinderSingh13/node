angular.module('kosmochat')

.controller('HomeCtrl',['$scope','$state','$cookies','$window','$http',function($scope,$state,$cookies,$window,$http){
	$scope.$state = $state;	
	$scope.setCookies = function(stateName){
		var expiresOn = new Date();
		expiresOn.setDate(expiresOn.getDate() + 30);

		$cookies.put('userCookies', 'rememberme',{
			expires:expiresOn
		});
		if(stateName)$state.go(stateName);
	}	
	if ($scope.cookies = $cookies.get('userCookies')) {
		var expiresOn = new Date();
		expiresOn.setDate(expiresOn.getDate() + 30);
		$state.go('filter.world');
	}
}])

.controller('feedbackController', ['$scope','$http', function($scope,$http){
	$scope.formData = {}
	$scope.submit = function(){
		if(!$scope.formData.name || !$scope.formData.email || !$scope.formData.message  ){
		$scope.feedbackValidate = true;
			return;
		}
		console.log($scope.formData);
		$http.post('/api/feedback',{data:$scope.formData}).success(function(data){
			$scope.thankyou = true
		})
	}
}])
.controller('loginController', ['$scope','$http','authAdmin','$location','loggedIn','Socket','getActiveVideoRooms','$interval','$timeout', function($scope,$http,authAdmin,$location,loggedIn,Socket,getActiveVideoRooms,$interval,$timeout){
	/*console.log('somewhere in controller');
	console.log(getActiveVideoRooms.getRooms());
	console.log('after somewhere in controller');*/


	//rooms();
	// ban a user

	// list of ban users

	var logged = loggedIn;
	if(!logged){
		$location.path('/')
	}
	$scope.register = {};
	$scope.login = {};

	$scope.registerUser = function(){
		if($scope.register.pass === $scope.register.cpass){
			$http.post('/api/register',{user: $scope.register}).success(function(data){
				console.log(data);
			})
		}
	}
	$scope.userLogin = function(){
		authAdmin.login($scope.login.username,$scope.login.pass) 
		.then(function(){
			$location.path('/admin');
		})
		.catch(function(){
			$scope.loginFailed = true;
		})
	}
}])
.controller('adminController', ['$scope','$http','authAdmin','$location','loggedIn','Socket','getActiveVideoRooms','$interval','$timeout', function($scope,$http,authAdmin,$location,loggedIn,Socket,getActiveVideoRooms,$interval,$timeout){
	/*console.log('somewhere in controller');
	console.log(getActiveVideoRooms.getRooms());
	console.log('after somewhere in controller');*/

	$scope.screenshots = [];
	$scope.adminSocket;
	Socket.on('connect',function(){            // connect admin to the socket
		Socket.emit('adminInit');
	});
	Socket.on('adminSocket',function(data){
      	$scope.adminSocket = data.adminSocket;
      	$scope.$digest();
		console.log('recieved admin Socket');
		console.log($scope.adminSocket);
		rooms(data.adminSocket);
	});

	$scope.getScreenshots = function(){
		$scope.screenshots = [];
		console.log('socket '+$scope.adminSocket);
		rooms($scope.adminSocket);
	}
	//rooms();
	//$interval(rooms, 50000);
	function rooms(adminSocket){
		console.log('rooms function');
		console.log(adminSocket);
		var myDataPromise = getActiveVideoRooms.getRooms();
		myDataPromise.then(function(result){
			console.log(result);
          findSockets(result.data, function(rooms){
          	$scope.rooms = rooms;
          	if(rooms.length >= 1){
				emitMsg($scope.rooms,adminSocket);
          	}
          	else{
          		console.log('no users online');
          	}
          })
		})
	};
    function findSockets(users, callback){ 
		var allRooms = [];
		for (var key in users) {         
	        var sockets = [];   
	        if (users.hasOwnProperty(key)) {
				if(users[key].length === 2){
					var i = 1;
					for(var socket in users[key].sockets){ 
						if (users[key].sockets.hasOwnProperty(socket)) {
							var sckt = "socket"+i;
							sockets.push({sckt:socket});
							i++
						}
					}
					allRooms.push({"room":key,"socket1":sockets[0].sckt,"socket2":sockets[1].sckt});              
				}
	    	}
		}
     	callback(allRooms);         
	};
	// emit a message in rooms
	function emitMsg(activeRooms,adminSocket){
		console.log('emit msg function');
		console.log('active Rooms '+activeRooms.length);
		console.log('admin socket '+adminSocket);
		$http.post('/api/admin/takeScreenshot',{rooms:activeRooms,adminSocket:adminSocket})
		.success(function(data){
			console.log('forwarding to get screenshot');
			//getScreenshots(data.datetimestamp);
		});
	}
	Socket.on('screenShotUploaded',function(data){
		console.log('screen shot added');
		console.log(data);
		$scope.screenshots.push(data);
	})
	/*var getScreenshots = function(folderName){
		$timeout(function(){
			console.log('reached at get screenshot');
			$http.post('/api/admin/grabAllScreenshots',{datetimestamp:folderName})
			.success(function(data){
				console.log('result of get screenshot');
				$scope.screenshots = data;
				console.log(data);
			})		
		},10000)
	}*/
	// ban a user
	$scope.selectedUsersForBan = []; // contain all the selected users for ban
	$scope.addUserToBanList = function(event,socketId,room){  // add user to selectedUsersForBan array		
		var id = socketId.slice(0, -4);
		console.log($scope.selectedUsersForBan.length);
		if($scope.selectedUsersForBan.length >= 1){
			var items = [];
			for(var k =0 ; k<$scope.selectedUsersForBan.length;k++){
				if($scope.selectedUsersForBan[k].id === id){
					items.push(k);
		    	}
			}
			console.log(items.length);
			if(items.length == 1){
	    		$(event.target).parents('.users_screenshots').removeClass('active');
	    		for(var k =0 ; k<$scope.selectedUsersForBan.length;k++){
	    			if($scope.selectedUsersForBan[k].id === id){
	    				$scope.selectedUsersForBan.splice(k , 1);
	    			}
	    		};
			}
			else{
				$(event.target).parents('.users_screenshots').addClass('active');
				$scope.selectedUsersForBan.push({id:id,room:room})
			};
		}
		else if($scope.selectedUsersForBan.length === 0){
			$(event.target).parents('.users_screenshots').addClass('active');
			$scope.selectedUsersForBan.push({id:id,room:room})
		}
	} 
	$scope.banUser = function(){
		$scope.screenshots = [];
		$http.post('/api/admin/banUser',{sockets:$scope.selectedUsersForBan})// emit user socket to the server
		.success(function(data){
			$timeout(function(){
				rooms($scope.adminSocket);
			},1000)
			console.log('ips has been positive to the server');
		})
		// at the server detects the ip of the socket
		// add user to the BAN table 
		// emit message to the user that he/she get banned
		// disconnect the sockets
	}
	// list of ban users
	$http.get('/api/admin/bannedUsers')
	.success(function(data){
		$scope.blockedUsersList = data;
		console.log(data);
	})
	var logged = loggedIn;
	if(!logged){
		$location.path('/')
	}
	$scope.register = {};
	$scope.login = {};

	$scope.registerUser = function(){
		if($scope.register.pass === $scope.register.cpass){
			$http.post('/api/register',{user: $scope.register}).success(function(data){
				console.log(data);
			})
		}
	}
	$scope.userLogin = function(){
		authAdmin.login($scope.login.username,$scope.login.pass) 
		.then(function(){
			$location.path('/admin');
		})
		.catch(function(){
			$scope.loginFailed = true;
		})
	}
}])
.constant('config', {
  // Change it for your app URL
  SIGNALIG_SERVER_URL: 'http://localhost:3000'
})
.run(function ($rootScope, $state,$timeout) {
// Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';
    // Safari <= 9 "[object HTMLElementConstructor]" 
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Internet Explorer 6-11
var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
var isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
var isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS;

	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
		$('html, body').animate({scrollTop: 0});	
		if(!fromState.name){
			console.log('dont have from state');
			console.log(toState.url.search("login"));
			if(toState.url.search("login") == 1 || toState.url.search("admin") == 1){
				return;
			}
			else{ 				
				window.location.href = "#/home";			
			}			
		}
		else{
			console.log('video '+toState.name.search("video"));
			if(toState.name.search("video") != -1){
				console.log('video');
				if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
				 // some code..
				}
				else{
					$.loadScript = function (url, callback) {
					    $.ajax({
					        url: url,
					        dataType: 'script',
					        success: callback,
					        async: true
					    });
					}
					$.loadScript('assets/javascripts/adapter.screenshare.min.js', function(){
					    //Stuff to do after someScript has loaded
					    console.log('loaded');
					});				
				}
			}
			else{
				$('iframe[name="adapterjs-alert"]').addClass('hideIframe');
			}
		}
		/*if(toState.name.search("chat") == -1 || fromState.name.search("chat") == -1){
			console.log('you are right');
		angular.element('iframe').addClass('hideIframe');
		}
		else{
			angular.element('iframe').removeClass('hideIframe');
		}*/
	});
})

