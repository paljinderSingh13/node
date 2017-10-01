angular.module('chatModule',['ui.router',
	'app.chat.controllers',
	'app.chat.directives']);
angular.module('app.chat.directives',[]);

angular.module('chatModule')
  .factory('VideoStream',['$q', function ($q) {
    var stream;
    
    return{

      sendAll:function() {
        
        var d = $q.defer();
        var errorElement = document.querySelector('#errorMsg');
        var constraints = window.constraints = {
          audio:true,
          video:true
        };
        var onSuccess = function(stream) {
          var videoTracks = stream.getVideoTracks();
          console.log('Using video device: ' + videoTracks[0].label);
          stream.onended = function() {
          console.log('Stream ended');
          };
          window.stream = stream; // make variable available to browser console
          
          d.resolve(stream);

        };

        var onFailure = function(error) {
          if (error.name === 'ConstraintNotSatisfiedError') {
            errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
                constraints.video.width.exact + ' px is not supported by your device.');
          } else if (error.name === 'PermissionDeniedError') {
            errorMsg('Permissions have not been granted to use your camera and ' +
              'microphone, you need to allow the page access to your devices in ' +
              'order for the demo to work.');
          }
          errorMsg('getUserMedia error: ' + error.name, error);
          d.reject(error);
        };
        
          
          AdapterJS.webRTCReady(function(isUsingPlugin) {
            if(typeof Promise === 'undefined'){
              navigator.getUserMedia(constraints, onSuccess, onFailure);
            }
            else{
              navigator.mediaDevices.getUserMedia(constraints)
              .then(onSuccess).catch(onFailure);
            }
          });
          function errorMsg(msg, error) {
            errorElement.innerHTML += '<p>' + msg + '</p>';
            if (typeof error !== 'undefined') {
              console.error(error);
            }
          }
          return d.promise;
        
      }
    };

  }])
  // chat room factory
  .factory('Room', ['$q', 'Socket', 'config', '$rootScope', function ( $q, Socket, config,$rootScope) {

    var iceConfig = { 'iceServers': [{ 'url': 'stun:stun4.l.google.com:19302' }]},
        peerConnections = {},
        currentId, roomId,partnerId,
        stream;

    function getPeerConnection(id,currentId) {
      if (peerConnections[id]) {
        return peerConnections[id];
      }
      var pc = new RTCPeerConnection(iceConfig);
      peerConnections[id] = pc;
      peerListeners(id,currentId,pc);
      return pc;
    }
    function peerListeners(id,currentId,pc){
      pc.addStream(stream);
      //console.log(pc)
      //console.log('stream: '+stream);
      //console.log('#step1');
      pc.onicecandidate = function (evnt) {
        Socket.emit('msg', { by: currentId, to: id, ice: evnt.candidate, type: 'ice' });
        //console.log('#step2');
      };
      pc.onaddstream = function (evnt) {
        //console.log('Received new stream');
        //console.log('update stream')
        api.trigger('peer.stream', [{
          id: id,
          stream: evnt.stream
        }]);
        console.log('#step3');
        if (!$rootScope.$$digest) {
          $rootScope.$apply();
        }
      };
    }



    function makeOffer(id,currentId) {
      var pc = getPeerConnection(id,currentId);
      
      pc.createOffer(function (sdp) {
        pc.setLocalDescription(sdp);
        //console.log('Creating an offer for', id);
        Socket.emit('msg', { by: currentId, to: id, sdp: sdp, type: 'sdp-offer' });
      }, function (e) {
        //console.log(e);
      },
      {  OfferToReceiveVideo: true, OfferToReceiveAudio: true });
    }

    function handleMessage(data) {
      var pc = getPeerConnection(data.by,data.to);
      console.log(pc);
      //console.log('data type : '+data.type);
      switch (data.type) {
        case 'sdp-offer':
          //console.log('data sdp: '+data.sdp);
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            //console.log('Setting remote description by offer of: '+ data.by);
            pc.createAnswer(function (sdp) {
              //console.log('enter create answer');
              pc.setLocalDescription(sdp, function(){
                //console.log(' set local description');
                Socket.emit('msg', { by: data.to, to: data.by, sdp: sdp, type: 'sdp-answer' });
                //console.log('current id: '+data.by+' to: '+data.by+'type: '+data.type);                
              },function (e) {
                //console.log('error local description');
                console.error(e);
              });
            },function (e) {
              //console.log('error create answer');
                console.error(e);
              });
          }, function (e) {
              console.error(e);
            });
          break;
        case 'sdp-answer':
        //console.log('recieve answer sdp below :');
        //console.log(data.sdp);
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            //console.log('Setting remote description by answer');
          }, function (e) {
            console.error(e);
          });
          break;
        case 'ice':
          if (data.ice) {
            //console.log('Adding ice candidates');
            pc.addIceCandidate(new RTCIceCandidate(data.ice));
            //console.log('added ice candidates');
          }
          break;
        case 'close':
            //console.log('Adding ice candidates');
            pc.close();
            //console.log('added ice candidates');
          break;
      }
    }

    Socket = Socket.connect(config.SIGNALIG_SERVER_URL);
    var connected = false;

    function addHandlers(Socket) {
      Socket.on('peer.connected', function (params) { 
        //console.log('peer connected ');
        currentId = params.id;
        partnerId = params.partner;
        makeOffer(params.partner,params.id);
      });
      Socket.on('peer.disconnected', function (data) {
        api.trigger('peer.disconnected', [data]);
        if (!$rootScope.$$digest) {
          $rootScope.$apply();
        }
      });
      Socket.on('msg', function (data) {
        handleMessage(data);
      });
    }

    var api = {
      joinRoom: function (r) {
        if (!connected) {
          Socket.emit('init', { room: r }, function (roomid, id) {
            currentId = id;
            roomId = roomid;
          });
          connected = true;
        }
      },
      createRoom: function () {
        var d = $q.defer();
        Socket.emit('init', null, function (roomid, id) {
          d.resolve(roomid);
          roomId = roomid;
          currentId = id;
          connected = true;
        });
        return d.promise;
      },
      init: function (s) {
        stream = s;
      }
    };
    EventEmitter.call(api);
    Object.setPrototypeOf(api, EventEmitter.prototype);

    addHandlers(Socket);
    return api;
  }])
.factory('quitButton',[function(){
  var quitButton,sureButton,newButton,connection;
  function hide(){
    quitButton = true;
    sureButton = false;
    newButton = true;
    connection = false;
  }
  function getConnection(){
    return connection;
  }
  function getQuitButtonValue(){
    return quitButton;
  }
  function getSureButtonValue(){
    return sureButton;
  }
  function getNewButtonValue(){
    return newButton;
  }
  return {
    hide:hide,
    getQuit:getQuitButtonValue,
    getSure:getSureButtonValue,
    getNew:getNewButtonValue,
    getConnection:getConnection
  };
}]);

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
angular.module('chatModule')

  // photo sharing factory
  .factory('sharePhoto',['Socket', function(Socket){
    // handle photo sharing request
    function photoShareRequest(userId,room){
      var photoRequested ={};
      photoRequested.request="sent";
      photoRequested.status=true;
      photoRequested.questionAsked=true;
      photoRequested.user=userId;
      photoRequested.room=room;
      Socket.emit("photoRequest",photoRequested);
    }

    // approve and reject notification

    return {
      request : photoShareRequest
    };
  }]);

angular.module('app.chat.controllers',['ngFileUpload'])


.controller('ChatCtrl',['$scope','$timeout','$state','$rootScope','filter','ngDialog','$http','Socket','AuthService','Upload', '$controller','$sce', '$window','sharePhoto','userip','quitButton',
	function($scope,$timeout,$state,$rootScope,filter,ngDialog,$http,Socket,AuthService,Upload,$controller,$sce,$window,sharePhoto,userip,quitButton){
	$(document).keyup(function(e) {
	     if (e.keyCode == 27) { // escape key maps to keycode `27`
	        // <DO YOUR WORK HERE>
	        if(!$scope.quitAlert){
				$scope.quitAlert = true;
				$scope.quitBtn = true;
			}
			else if($scope.quitAlert){
				if($scope.newChat){
					$scope.newChatStart();
					return;
				}
				$scope.quitChat();
			}
			
			$scope.$digest();
	    }
	});
	var interval_id;
	$(window).focus(function() {
	    document.title = 'Kosmochat';
	});
	// on route change disconnect chat
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){ 
		if(toState.name.search("chat") == -1){
			if($scope.chatConnected === false){return;}
			Socket.emit('userDisconnect',{room:$scope.partnerInfo.room,msg:'Your partner left the chat.'});
			Socket.disconnect();
			console.log('moved out of the chat');
		}
		
	});
	$scope.messages = []; // will contain all the messages
	var selectedFilterValue = filter.getT(); // filter value selected by user
	var selectedCountryValue = filter.getA(); // country filter value selected by user
	$scope.userInterests = filter.getI(); // it will convert in string to post in node
	$scope.interestDisabled = filter.GetD(); // find out if interest are disabled
	$scope.chatConnected = false; // to hide camera and smiley icon and disable send button
	$scope.photoSharingAccepted = false; // activate camera icon
	$scope.chatHeadMessage = 'Searching for a chat partner...'; // chat head message
	$scope.chatendMsg = 'You left the chat.'; // chat end message
	$scope.userIP = userip.get(); // get user's ip from service
	$scope.sessId = {}; // session id


	// if user fill any interest convert it to string and send it to backend for process
	if($scope.userInterests.length >= 1 && $scope.interestDisabled === false || $scope.userInterests.length >= 1 && !$scope.interestDisabled ){
		$scope.chatHeadMessage = 'Searching for a chat partner with similar interests...';
		// head message for if interest selected
		//$scope.chatHeadMessage = '';
		var interestsString;
		// add interests array into string
		for(var int = 0; int < $scope.userInterests.length; int++){
			var interestTxt = $scope.userInterests[int];
			if(int === 0){
				interestsString = interestTxt.substring(1);
			}
			else{
				interestsString = interestsString+','+interestTxt.substring(1);
			}
		}
		$scope.userInterests = interestsString;
	}
	else{
		$scope.userInterests = '';
	}
	
	$scope.resetFilter = function() {
	  console.log('esc key pressed');
	};
	$scope.myFunct = function(event){
		console.log('myFunct');
	};
	

	// get ip address and geo location
	Socket.on('connect',function(){
			/*var geo = 'https://api.hackertarget.com/geoip/?q='+$scope.userIP;	
			$http.get(geo).then(function(geoLocation){
				$scope.userLongtitude = geoLocation.data.longitude;
				$scope.userLatitude = geoLocation.data.latitude;
				$scope.userCountry = geoLocation.data.country_name;
				emitUserAdditionalInfo();			
			})*/
			// verify ip from the backend
			$http.post('/api/verifyIp',{ip:$scope.userIP})
			.success(function(data){
				if(data == 'banned'){
					$state.go('home');
				}
				else{
					// get location only if user select nearby filter
					if(selectedFilterValue == 'nearby'){
						getLocation();
					}
					else{
						emitUserAdditionalInfo();
					}
				}
			});
			function getLocation() {
			    if (navigator.geolocation) {
			        navigator.geolocation.getCurrentPosition(showPosition, showError);
			    } else { 
			        error = "Geolocation is not supported by this browser.";
			    }
			}
			function showPosition(position) {
				$scope.userLongtitude = position.coords.longitude;
				$scope.userLatitude = position.coords.latitude;
				console.log($scope.userLongtitude);
				var googleAPI = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+$scope.userLatitude+','+$scope.userLongtitude+'&sensor=false';
				$http.get(googleAPI).then(function(geoLocation){
					$scope.userCountry = geoLocation.data.results[0].address_components[6].long_name;
				});
				emitUserAdditionalInfo();
			}
			function showError(error) {
				$state.go('filters/world');
			    switch(error.code) {
			        case error.PERMISSION_DENIED:
			            error = "User denied the request for Geolocation.";
			            break;
			        case error.POSITION_UNAVAILABLE:
			            error = "Location information is unavailable.";
			            break;
			        case error.TIMEOUT:
			            error = "The request to get user location timed out.";
			            break;
			        case error.UNKNOWN_ERROR:
			            error = "An unknown error occurred.";
			            break;
			    }
			}
	});
	// user is typing
	$scope.keyup = function(){Socket.emit('sendingMsg',{room:$scope.partnerInfo.room,from:$scope.userInfo._id,msg:'yes'});};
	$scope.keydown = function(){Socket.emit('sendingMsg',{room:$scope.partnerInfo.room,msg:'no'});};

	// recieve when other user is typing
	Socket.on('userTyping',function(data){
		if(data.from === $scope.userInfo._id){return;} // match the user id
		if(data.msg === 'yes'){
			$scope.userTyping = true; // show the notification
		}
		else{
			$scope.userTyping = false; // hide the notification
		}
	});
	
	// send user info
	function emitUserAdditionalInfo(){
		$scope.emitUser = {};
		$scope.emitUser.filter = selectedFilterValue;
		$scope.emitUser.country = selectedCountryValue;
		$scope.emitUser.interest = $scope.userInterests;
		$scope.emitUser.ip = $scope.userIP;
		$scope.emitUser.long = $scope.userLongtitude;
		$scope.emitUser.lat = $scope.userLatitude;
		$scope.emitUser.userCountry = $scope.userCountry;
		$scope.emitUser.type = 'text';
		Socket.emit('userAdditionalInfo',$scope.emitUser);
	}
	// Get user data
	Socket.on('user',function(data){
		$scope.userInfo = data;
		console.log(data);
		data.type = 'text';
		// search for partner
		$window.sessionStorage.setItem('userId',data._id);
		$scope.userId = data._id;
		findPartner(data);
	});
	// On disconnection
	Socket.on('disconnected',function(data){
		$scope.messages.push({msg:data});
		$scope.$digest();
		$state.go('chat.end');
	});
	// Get messages from server
	Socket.on('get msg',function(data){
		var receivedMessage = data;
		var msg = receivedMessage.msg.toString();
		receivedMessage.msg = $sce.trustAsHtml(msg);
		if(data.user != $scope.userId){
			document.title = 'You received a new msg';
		}
		$scope.messages.push(data);
		$scope.$digest();
	});
	// find a partner
	function findPartner(userInfo){
		AuthService.sessId(userInfo)
		.then(function(partnerInfo){
			if(partnerInfo){
				$window.sessionStorage.setItem("partnerId",partnerInfo.partnerId);
				$scope.partnerId = partnerInfo.partnerId;
				$scope.sessId = partnerInfo;
			}
			//console.log($scope.sessId);
			if(partnerInfo == 'no partner found'){
				//notFound(userInfo);
				return;
			}
			$scope.chatHeadFound = partnerInfo.msg;

			$scope.partnerInfo = partnerInfo;
			userip.setPartner(partnerInfo.ip,partnerInfo.room); // set ip of partner to use later in report module
			$scope.chatConnected = true;
			angular.element(document.querySelector('#focusedInput')).focus();
		},
		function(){
			//notFound(userInfo);
		});
	}
	// find Again
	$scope.findAgain = function(userInfo){
		findPartner(userInfo);
	};
	// Partner connected other way
	Socket.on('partnersConnected',function(data){
		if (data) {
			$window.sessionStorage.setItem("partnerId",data.partnerId);
			$scope.partnerId = data.partnerId;
			$scope.sessId = data;
		}

		$state.go('chat.connect');
		$scope.connection = data;
		$scope.chatHeadFound = data.msg;
		$scope.partnerInfo = data;
		userip.setPartner(data.ip,data.room); // set ip of partner to use later in report module
		$scope.chatConnected = true;
		angular.element(document.querySelector('#focusedInput')).focus();

			console.log($scope.partnerInfo);
		$scope.$digest();
	});
	// set heads
	Socket.on('no nearby', function(data){
		$scope.chatHeadMessageNearby = data;
	});
	Socket.on('no country', function(data){
		$scope.chatHeadMessageCountry = data;
	});
	Socket.on('matchedInterests', function(data){
		$scope.chatHeadMessageInterests = data.msg;
	});
	function notFound(userInfo){
		$state.go('chat.notFound');
	}
	// chat end
	Socket.on('chatEnd',function(data){
		$scope.quitAlert = true;
		$scope.quitBtn = false;
		$scope.newChat = true;
		$scope.chatConnected = false; // to disable camera and smiley icon
		$scope.chatHeadMessage = 'Disconnected';
		$scope.chatendMsg = data.msg;
		$scope.$digest();
		$state.go('chat.connect.end');
		// scrolling div
		$timeout(function(){
			$(".scroll-body").slimScroll({scrollTo: $('#chat-messages').height()});
			$('.scroll-body').scrollTop($('#chat-messages').height());
		},200);
	});


	// open filter popup
	$scope.filters = function(){
		ngDialog.open({
			template:'modules/chat/views/filtersPopup.html',
			className: 'ngdialog-theme-default filtersPopup',
			controller: ['$scope','$state','ngDialog',function($scope,$state,ngDialog){
				$scope.goToFilter = function(){
					//close chat
					$state.go('filter.world');
				};
			}]
		});
	};

	

	$scope.sendMessage = function(){
		if(!$scope.message){return;}
		var text = wdtEmojiBundle.render($scope.message);
		//console.log($scope.userId)
		var msg = {"msg":text,"user":$scope.userId,"room":$scope.connection.room};
		Socket.emit('send msg', msg);
		Socket.emit('sendingMsg',{room:$scope.partnerInfo.room,msg:'no'});
		$scope.message = '';
	};
	$scope.quit = function(){
		$scope.quitAlert = true;
		$scope.quitBtn = true;
	};
	// Quit Chat
	$scope.quitChat = function(){
		$scope.quitBtn = false;
		$scope.newChat = true;
		$scope.chatConnected = false; // to disable camera and smiley icon
		$scope.message = ''; // empty input field
		$scope.chatHeadMessage = 'Disconnected';
		$scope.chatendMsg = 'You left the chat.';
		if(!$scope.partnerInfo){
			$state.go('chat.connect.end');
			return;
		}
		else{
			Socket.emit('userDisconnect',{room:$scope.partnerInfo.room,msg:'Your partner left the chat.'});
			$state.go('chat.connect.end');
		}		
		// scrolling div
		$timeout(function(){
			$(".scroll-body").slimScroll({scrollTo: $('#chat-messages').height()});
			$('.scroll-body').scrollTop($('#chat-messages').height());
		},200);
	};
	// New Chat button
	$scope.newChatStart = function(){
		if($scope.userInterests.length >= 1 && $scope.interestDisabled === false || $scope.userInterests.length >= 1 && !$scope.interestDisabled ){
			$scope.chatHeadMessage = 'Searching for a chat partner with similar interests...';
		}
		else{
			$scope.chatHeadMessage = 'Searching for a chat partner...'; // show searching partner message			
		}
		Socket.emit('new chat'); // emit and add user again to sockets array
		$state.go('chat.connect'); // go to chat connecting state
		$scope.chatHeadFound = false; // hide the partner found message
		$scope.messages = []; // to clean the previos messages
		$scope.quitAlert = false; // to show quit button
		$scope.newChat = false; // to hide new button
		$scope.chatConnected = false; // to disable camera and smiley icon
		$scope.chatHeadMessageInterests = ''; //disable matched text
		$scope.chatHeadMessageNearby = ''; //disable nearby message
		$scope.chatHeadMessageCountry = ''; //disable country message
		$scope.chatendMsg = 'You left the chat.';
		console.log('finding partner again');
		console.log($scope.userInfo);
		findPartner($scope.userInfo);
	};
	$scope.report = function(){
		console.log('report');
		ngDialog.open({template:'modules/chat/views/reportPopup.html',
			className: 'ngdialog-theme-default reportPopup',
			controller: 'reportUser',
    		showClose: false
		}).closePromise.then(function (data) {
			$scope.quitAlert = quitButton.getQuit();
			$scope.quitBtn = quitButton.getSure();
			$scope.newChat = quitButton.getNew();
			$scope.chatConnected = quitButton.getConnection();
		});
	};

	// send photo request
	$scope.photoRequested = {
		request : "",
		user:$scope.userId,
		msg:'',
		class:'',
		allowed:'' ,
		status:false,
		questionAsked:false,
		questionView:false,
		photoSent:false
	};
	$scope.photoRequestOptions = function(){
		if($scope.photoRequested.questionAsked === false && $scope.photoRequested.allowed === ""){
			$scope.photoSharing = !$scope.photoSharing;
		}
		// if request accepted allow users to send photos
		else if($scope.photoRequested.questionAsked === true && $scope.photoRequested.allowed === true){
			$scope.photoSharingOptions = !$scope.photoSharingOptions;
		}
		// if partner decline photo sharing request
		else if($scope.photoRequested.allowed === false){
			$scope.photoSharingSent = false;
			$scope.photoSharingRejected = !$scope.photoSharingRejected;
		}
		// if user send the request and not recieve response from partner
		else if($scope.photoRequested.questionAsked === true){
			$scope.photoSharingSent = !$scope.photoSharingSent;
		}
		// if partner accept photo sharing request
		else if($scope.photoRequested.allowed === true){
			$scope.makeCameraBlue = true;
			$scope.photoSharingOptions = !$scope.photoSharingOptions;
		}
	};
	$scope.sendPhotoSharingRequest = function() {

		sharePhoto.request($scope.userId,$scope.partnerInfo.room);		
		/*$scope.photoRequested.request = "sent";
		$scope.photoRequested.status = true;
		$scope.photoRequested.questionAsked = true;
		$scope.photoRequested.user = $scope.userId;
		$scope.photoRequested.room = $scope.partnerInfo.room;*/
		// show msg to user that request sent
		//Socket.emit("photoRequest",$scope.photoRequested);
		// remove sharing request element
		$scope.photoRequested.questionAsked = true;
		$scope.messages.push({"msg":'Photo sharing request sent',"user":"me","class":"notification green",'notification':true});
		var elem = angular.element( document.querySelector( '#photoSharingButton' ) );
		elem.remove();
    };
    $scope.photoRequestResponse = function(res){
		if(res == "accept"){
			$scope.photoSharingAccepted = true;
			$scope.photoRequested.request = "accepted";
			$scope.photoRequested.msg = "Photo sharing request accepted";
			$scope.photoRequested.class = "notification green";
			$scope.photoRequested.user = $scope.userId;
			$scope.photoRequested.room = $scope.partnerInfo.room;
			$scope.photoRequested.allowed = true;
			Socket.emit("photoRequest",$scope.photoRequested);
		}
		else{

			$scope.photoRequested.request = "declined";
			$scope.photoRequested.msg = "Photo sharing request declined";
			$scope.photoRequested.class = "notification danger";
			$scope.photoRequested.user = $scope.userId;
			$scope.photoRequested.room = $scope.partnerInfo.room;
			$scope.photoRequested.allowed = false;
			Socket.emit("photoRequest",$scope.photoRequested);

	
		}
		$scope.photoRequested.questionView = false;
	};
	// || STEP 2 ||when receive photo request
	Socket.on('photoRequest',function(data){
		var isNotification;
		// if partner accept the request turn the camera icon into blue
		if(data.request === "accepted"){
			$scope.makeCameraBlue = true;
		}
		// turn on question view if request status is sent
		if(data.request === "sent" && data.user !==  $scope.userId){
			$scope.photoRequested.questionView = true;
		}
		// if request accepted by partner
		else if(data.request === "accepted" && data.user !==  $scope.userId){
			isNotification = data;
			isNotification.notification = true;
			$scope.messages.push(data);
			$scope.photoRequested.allowed = true;
			$scope.photoRequested.questionView = false;

		}
		// if request decline by partner
		else if(data.request === "declined" && data.user !==  $scope.userId){
			$scope.photoRequested.allowed = false;
			$scope.photoRequested.questionView = false;
			isNotification = data;
			isNotification.notification = true;
			$scope.messages.push(isNotification);
		}
		// scrolling div
		$timeout(function(){
			$(".scroll-body").slimScroll({scrollTo: $('#chat-messages').height()});
			$('.scroll-body').scrollTop($('#chat-messages').height());
		},200);	
		$scope.$digest();

	});
	$scope.preloader = false;
    
	// for opening camera screen
	$scope.openCam = function(){
		ngDialog.open({
			template:'modules/chat/views/take-photo.html',
			className: 'ngdialog-theme-default takePhoto',
			controller:'captureImage',
			closeByEscape :true
		}).closePromise.then(function (data) {

		    $scope.photoSharingOptions = false;
		});
	};
	// for opening camera screen
	$scope.openUploadScreen = function(){
		ngDialog.open({
			template:'modules/chat/views/upload-photo.html',
			className: 'ngdialog-theme-default takePhoto',
			controller: 'fileHandlling',
			closeByEscape :true
		}).closePromise.then(function (data) {

		    $scope.photoSharingOptions = false;
		});

	};
	Socket.on('imageSent',function(data){
		if(data.userSession !==  $scope.userId){
			data.fileOpended =false;
			$sce.trustAsHtml(data);
			$scope.messages.push(data);
			$scope.$digest();
			console.log($scope.messages);
		}
		else{
			$scope.messages.push({'msg':"Photo sent",'photoInfo':true});
			$scope.photoRequested.photoSent = true;
			//$scope.photoSharingOptions = !$scope.photoSharingOptions
			$scope.$digest();
		}
	});

	//$scope.fileOpended = false;
	// for opening camera screen
	$scope.openPhoto = function(id,file,time,elem){
		Socket.emit('photo opened',{ "msg":"Photo Opened","user":$scope.userId ,"room":$scope.connection.room});

    	

        	//angular.element(elem.target).replaceWith('<a href="javascript:void(0)">Photo Expired</a>');
		var info = {
			id:id,
			path:"uploads/" +file,
			ttl:time,
			elem:elem
		};
		ngDialog.open({
			template:'modules/chat/views/open-photo.html',
			className: 'ngdialog-theme-default takePhoto openPhoto',
		    controller:'openImage', 
		    resolve: {
		        imageData: function getPath() {
		            return info;
		        }
		    }
		}).closePromise.then(function (data) {

		    angular.element(elem.target).replaceWith('<a href="javascript:void(0)">Photo Expired</a>');
		});
	};
	Socket.on('photo opened',function(data){
		if(data.user !==  $scope.userId){
			var updateData = data;
			updateData.user = $scope.userId;
			$scope.messages.push(updateData);
			$scope.$digest();
		}
	});

	// emoji picker

	wdtEmojiBundle.init('.wdt-emoji-bundle-enabled');
	$scope.openPicker = true;
	$scope.closePicker = false;
	$scope.message = "";
	wdtEmojiBundle.fillPickerPopup();
	$scope.openEmojiPicker = function(){
		wdtEmojiBundle.fillPickerPopup();
		wdtEmojiBundle.openPicker();
		var emojiList = document.querySelector('.wdt-emoji-popup');
		emojiList.classList.add("open");
		$scope.openPicker = false;
		$scope.closePicker = true;
	};
	$scope.closeEmojiPicker = function(){
		var emojiList = document.querySelector('.wdt-emoji-popup');
		emojiList.classList.remove("open");
		$scope.openPicker = true;
		$scope.closePicker = false;
	};
	$scope.escPicker = function(ev){
		if(ev.keyCode === 27){
			var emojiList = document.querySelector('.wdt-emoji-popup');
			emojiList.classList.remove("open");
			$scope.openPicker = true;
			$scope.closePicker = false;
		}
	};
	//text screenshot
	$scope.chatShot = function(){
		/*html2canvas(document.querySelector('#chat-messages'), {
		  onrendered: function(canvas) {
		    console.log(canvas)
		    document.body.appendChild(canvas);
		  }
		});*/
		domtoimage.src(document.querySelector('#chat-messages'))
	    .then(function (data) {
	    	var logo = document.querySelector('.main-logo img');
	    	var logoHeight = logo.clientHeight;
	    	var logoWidth = logo.clientWidth;
	    	var canvas = document.createElement('canvas');
	    	canvas.width = (data.srceWidth > logoWidth )? data.srceWidth : logoWidth;
            canvas.height = data.srceHeight + logoHeight -235;
            var logoPosition = (data.srceWidth- logoWidth)/2;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(logo, logoPosition, 50);
            ctx.drawImage(data.srce, 0, logoHeight-20);
            //document.body.appendChild(canvas)
	       	
	       	var dataUrl = canvas.toDataURL('image/png');

	       	var a = document.createElement('a');
			a.href = dataUrl;
			a.target = "_blank";
			a.download = 'screen-shot.png';
			document.body.appendChild(a);
			a.click();
	    })
	    .catch(function (error) {
	        console.error('oops, something went wrong!', error);
	    });
	};

	
}])
.controller('captureImage', ['$scope','Upload','AuthService', '$window' ,'$http',function($scope,Upload,AuthService,$window,$http){
	var userId = $window.sessionStorage.getItem('userId');
	$scope.picFile = null;
	$scope.phototiming = 10;
 	$scope.preloader = false;
    $scope.imgFile  = {};
	$scope.takePicture = function() {
		$scope.picFile = !$scope.picFile;
		var video = document.getElementById('videoElement');
	    var canvas = document.getElementById('canvas');
	    var photo = document.getElementById('photo');
	    /*var height = video.videoHeight;
	    var width = video.videoWidth;*/
	    //force width and height
	    var height = 357;
	    var width = 557;
	    var context = canvas.getContext('2d');
	    canvas.width = width;
	    canvas.height = height;
	    context.drawImage(video, 0, 0, width, height);
	    

	    var data = canvas.toDataURL('image/png');
	    photo.setAttribute('src', data);

	    $scope.imgData = JSON.stringify(data.replace(/^data:image\/(png|jpg);base64,/, ""));

  	};		

  	$scope.clearPhoto = function() {
  		$scope.picFile = !$scope.picFile;
  		var video = document.getElementById('videoElement');
	    var canvas = document.getElementById('canvas');
	    var photo = document.getElementById('photo');
	    var height = video.videoHeight;
	    var width = video.videoWidth;
	    var context = canvas.getContext('2d');
	    context.fillStyle = "#AAA";
	    context.fillRect(0, 0, canvas.width, canvas.height);
	    var data = canvas.toDataURL('image/png');
	    photo.setAttribute('src', data);
  	};
  	$scope.uploadFile = function () {
	 	$scope.closeThisDialog();
    	$scope.picFile = !null;
    	var file = $scope.imgData;
    	$http.post('api/webcamUpload',{
    		timing : $scope.phototiming,
    		user:userId,
    		img:file
    	})
    	.success(function(err,data){
    		console.log('file uploaded');
    	});
    };
}])
.controller('fileHandlling', [ '$scope','Upload','AuthService', '$window' , function($scope,Upload,AuthService,$window ){

	var userId = $window.sessionStorage.getItem('userId');
	$scope.picFile = false;
	$scope.phototiming = 10;
 	$scope.preloader = false;
    $scope.imgFile  = {};
    
    $scope.$watch(function() { return $scope.imgFile; },
	      function() {
	      	if($scope.imgFile.name){
	      		$scope.picFile = true;
	      	}
	      }
    );

    $scope.uploadFile = function () {
	 	$scope.closeThisDialog();
    	$scope.picFile = false;
    	var file = $scope.imgFile;
        Upload.upload({
            url: '/api/fileUpload',
            data:{timing : $scope.phototiming,user:userId},
            file:file 
         }).then(function (resp) { 

                $scope.preloader = false;

         }, function (resp) { 
            $scope.preloader = false;
           
         }, function (evt) { 
            
            $scope.preloader = true;
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.progress = 'progress: ' + progressPercentage + '% ';
        });
    };
}])
.controller('openImage', ['$scope','imageData', '$timeout', '$http',"$window",'$interval' , function($scope,imageData,$timeout,$http,$window,$interval){
	var userId = $window.sessionStorage.getItem('userId');
	$scope.getUserImg = imageData.path;
	$scope.ttl = imageData.ttl;
	$interval(function(){

		$scope.ttl -= 1;
	},1000);

	$timeout(function(){
		$scope.closeThisDialog();
		$http.post("/api/deletePhoto/"+imageData.id).then(function(res){
			console.log(res);
		});
	}, (imageData.ttl * 1000));
}])
.directive('noCacheSrc', ['$window', function($window) {
  return {
    priority: 99,
    link: function(scope, element, attrs) {
      attrs.$observe('noCacheSrc', function(noCacheSrc) {
        noCacheSrc += '?' + (new Date()).getTime();
        attrs.$set('src', noCacheSrc);
      });
    }
  };
}])




.directive('videoPlayer', ['$sce', function ($sce) {
	return {
	  template: '<div><video ng-src="{{trustSrc()}}" autoplay id="partner_video"></video></div>',
	  restrict: 'E',
	  replace: true,
	  scope: {
	    vidSrc: '@'
	  },
	  link: function (scope) {
	    scope.trustSrc = function () {
	      if (!scope.vidSrc) {
	        return undefined;
	      }
	      return $sce.trustAsResourceUrl(scope.vidSrc);
	    };
	  }
	};
}]);
angular.module('app.chat.controllers')


.controller('ChatEndCtrl',['$scope','filter','quitButton' ,function($scope,filter,quitButton){
	
	// Interests code
	// interestAdded
	$scope.userInterestsArray = filter.getI(); // it will convert in string to post in node
	$scope.interestDisabled = filter.GetD(); // find out if interest are disabled
	$scope.interestAdded = function(){
		if(!$scope.interest){return;}
		var interest = $scope.interest;
		var n = interest.indexOf("#");
		if(n == -1){
			var nInterest = '#'+$scope.interest;
			filter.setInt(nInterest);
		}
		else{
			filter.setInt($scope.interest);
		}
		$scope.interest = '';
		$scope.interestText = '';
		$scope.smallInput = true;
	};
	// remove interest
	$scope.removeInterest = function(interest){
		filter.removeInt(interest);
		if($scope.userInterestsArray.length === 0){
			$scope.interestText = 'Add interest (press Enter to confirm an interest)';
			$scope.smallInput = false;
		}
		else{
			$scope.interestText = '';
			$scope.smallInput = true;
		}
	};
	// Interests code
}]);
angular.module('app.chat.controllers')
.controller('reportUser',['$scope','userip','$state','Socket','quitButton',function($scope,userip,$state,Socket,quitButton){
	var partnerip = userip.getPartner();
	var room = userip.getroom();
	$scope.setReason = function(event, reason){
		$scope.reason = reason;
		$(event.target).parent('div').siblings('div').children('.report__popup__button').removeClass('active');
		$(event.target).addClass('active');
	};
	$scope.submitReport = function(reason){
		
		$scope.closeThisDialog();
		quitButton.hide();
		console.log(quitButton.getQuit());
		$scope.chatConnected = false; // to disable camera and smiley icon
		$scope.quitAlert = true;
		$scope.quitBtn = false;// Hide quit btn
		$scope.newChat = true; // Show newChat button
		Socket.emit('userDisconnect',{room:room,msg:'Your partner left the chat.'});
		Socket.disconnect();
		$state.go('chat.connect.reportend');
	};

}]);
angular.module('app.chat.controllers')
// video chat controller

.controller('VideoChatCtrl', ['$scope','$location','$sce','VideoStream', '$timeout', '$http','Room' ,'$state','$stateParams','$rootScope','filter','ngDialog','Socket','videoChat','Upload', '$controller','$window','userip','quitButton', 
	function($scope,$location,$sce,VideoStream,$timeout,$http,Room,$state,$stateParams,$rootScope,filter,ngDialog,Socket,videoChat,Upload,$controller,$window,userip,quitButton){

    // models defination
	$scope.messages = []; // will contain all the messages
	var selectedFilterValue = filter.getT(); // filter value selected by user
	var selectedCountryValue = filter.getA(); // country filter value selected by user
	$scope.userInterests = filter.getI(); // it will convert in string to post in node
	$scope.interestDisabled = filter.GetD(); // find out if interest are disabled
	$scope.userIP = userip.get(); // get user's ip from service
	$scope.chatConnected = false; // to hide camera and smiley icon and disable send button
	$scope.chatHeadMessage = 'Searching for a chat partner...'; // chat head message
	$scope.chatendMsg = 'You left the chat.'; // chat end message
	$scope.sessId = {};


	var userId = $window.sessionStorage.getItem('userId');
    var stream;
    $scope.peers = [];

	$(document).keyup(function(e) {
	     if (e.keyCode == 27) { // escape key maps to keycode `27`
	        // <DO YOUR WORK HERE>
	        if(!$scope.quitAlert){
				$scope.quitAlert = true;
				$scope.quitBtn = true;
			}
			else if($scope.quitAlert){
				if($scope.newChat){
					$scope.newChatStart();
					return;
				}
				$scope.quitChat();
			}
			
			$scope.$digest();
	    }
	});
	$(window).focus(function() {
	    document.title = 'Kosmochat';
	});
	var video = document.querySelector('#your_video');
    // get video stream function
    function getVideoStream(){    	
	    VideoStream.sendAll()
	    .then(function (s) {
	      stream = s;
	      Room.init(stream);
	      streamUrl = attachMediaStream(video, stream); 
	      //streamSt = streamUrl.toString();
	      console.log(streamUrl);
	      $scope.localVideo = streamUrl; 
	      //Room.joinRoom($stateParams.roomId);
	      // after success emit user details to server
	      emitUserAdditionalInfoVideo();
	      
	    }, function () {
	      $scope.error = 'No audio/video permissions. Please refresh your browser and allow the audio/video capturing.';
	    	console.log($scope.error);
	    	emitUserAdditionalInfoVideoError();
	    });
    }
    // only audio
    $scope.onlyAudio = function(){
    	$scope.webcamStopped = !$scope.webcamStopped;
		stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
      	streamUrl = attachMediaStream(video, stream);
      	$scope.localVideo = streamUrl;
      	if($scope.chatConnected === true ){
      		Socket.emit('updatePeer',{'room':$scope.connection.room,'toggle':'video','user':$scope.userInfo._id});   	
      	}
    	
    };
    // only video and mute audio 
    $scope.onlyVideo = function(){
    	$scope.micStopped = !$scope.micStopped;
    	if($scope.chatConnected === true ){
    		Socket.emit('updatePeer',{'room':$scope.connection.room,'toggle':'audio','user':$scope.userInfo._id});
    	}
    };
    // mute partner
    $scope.mutePartner = function(){
    	$scope.partnerMuted = !$scope.partnerMuted;
    	var video = document.querySelector('#partner_video');
    	if($scope.partnerMuted){
    		video.muted= true;
    	}
    	else{
    		video.muted= false;
    	}
    };


	// if user fill any interest convert it to string and send it to backend for process
	if($scope.userInterests.length >= 1 && $scope.interestDisabled === false){
		$scope.chatHeadMessage = 'Searching for a chat partner with similar interests...';
		// head message for if interest selected
		//$scope.chatHeadMessage = '';
		var interestsString;
		// add interests array into string
		for(var int = 0; int < $scope.userInterests.length; int++){
			var interestTxt = $scope.userInterests[int];
			if(int === 0){
				interestsString = interestTxt.substring(1);
			}
			else{
				interestsString = interestsString+','+interestTxt.substring(1);
			}
		}
		$scope.userInterests = interestsString;
	}
	else{
		$scope.userInterests = '';
	}

	// emoji picker

	wdtEmojiBundle.init('.wdt-emoji-bundle-enabled');
	$scope.openPicker = true;
	$scope.closePicker = false;
	$scope.message = "";
	wdtEmojiBundle.fillPickerPopup();
	$scope.openEmojiPicker = function(){
		wdtEmojiBundle.fillPickerPopup();
		wdtEmojiBundle.openPicker();
		var emojiList = document.querySelector('.wdt-emoji-popup');
		emojiList.classList.add("open");
		$scope.openPicker = false;
		$scope.closePicker = true;
	};
	$scope.closeEmojiPicker = function(){
		var emojiList = document.querySelector('.wdt-emoji-popup');
		emojiList.classList.remove("open");
		$scope.openPicker = true;
		$scope.closePicker = false;
	};
	$scope.escPicker = function(ev){
		if(ev.keyCode === 27){
			var emojiList = document.querySelector('.wdt-emoji-popup');
			emojiList.classList.remove("open");
			$scope.openPicker = true;
			$scope.closePicker = false;
		}
	};
	
	// user is typing
	$scope.keyup = function(){
		Socket.emit('sendingMsg',{room:$scope.partnerInfo.room,from:$scope.userInfo._id,msg:'yes'});
	};
	$scope.keydown = function(){
		Socket.emit('sendingMsg',{room:$scope.partnerInfo.room,msg:'no'});
	};

	// get ip address and geo location
	Socket.on('connect',function(){


		if (!window.RTCPeerConnection || !navigator.getUserMedia) {
	      $scope.error = 'WebRTC is not supported by your browser. You can try the app with Chrome and Firefox.';
	      return;
	    }
		// verify ip from the backend
		$http.post('/api/verifyIp',{ip:$scope.userIP})
		.success(function(data){
			if(data == 'banned'){
				$state.go('home');
			}
			else{
				// get location only if user select nearby filter
				if(selectedFilterValue == 'nearby'){
					getLocation();
				}
				else{
					getVideoStream();
				}
			}
		});
		function getLocation() {
		    if (navigator.geolocation) {
		        navigator.geolocation.getCurrentPosition(showPosition, showError);
		    } else { 
		        error = "Geolocation is not supported by this browser.";
		    }
		}
		function showPosition(position) {
			$scope.userLongtitude = position.coords.longitude;
			$scope.userLatitude = position.coords.latitude;
			console.log($scope.userLongtitude);
			var googleAPI = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+$scope.userLatitude+','+$scope.userLongtitude+'&sensor=false';
			$http.get(googleAPI).then(function(geoLocation){
				$scope.userCountry = geoLocation.data.results[0].address_components[6].long_name;
			});
			getVideoStream();
		}
		function showError(error) {
			$state.go('filters/world');
		    switch(error.code) {
		        case error.PERMISSION_DENIED:
		            error = "User denied the request for Geolocation.";
		            break;
		        case error.POSITION_UNAVAILABLE:
		            error = "Location information is unavailable.";
		            break;
		        case error.TIMEOUT:
		            error = "The request to get user location timed out.";
		            break;
		        case error.UNKNOWN_ERROR:
		            error = "An unknown error occurred.";
		            break;
		    }
		}	
	});

    // On Banned
    Socket.on('user ban',function(){
		$scope.banned = true;
		$scope.chatHeadMessage = false;
		$scope.peers = [];
		Socket.emit('userDisconnect',{room:$scope.partnerInfo.room,msg:'Your partner left the chat.'});
    	Socket.disconnect();
		chatEndButtons();
    });

	// send user info
	function emitUserAdditionalInfoVideo(){
		$scope.emitUser = {};
		$scope.emitUser.filter = selectedFilterValue;
		$scope.emitUser.country = selectedCountryValue;
		$scope.emitUser.interest = $scope.userInterests;
		$scope.emitUser.ip = $scope.userIP;
		$scope.emitUser.long = $scope.userLongtitude;
		$scope.emitUser.lat = $scope.userLatitude;
		$scope.emitUser.userCountry = $scope.userCountry;
		$scope.emitUser.type = 'video';
		Socket.emit('video__userAdditionalInfo',$scope.emitUser);
	}

	// send user info
	function emitUserAdditionalInfoVideoError(){
		$scope.emitUser = {};
		$scope.emitUser.filter = selectedFilterValue;
		$scope.emitUser.country = selectedCountryValue;
		$scope.emitUser.interest = $scope.userInterests;
		$scope.emitUser.ip = $scope.userIP;
		$scope.emitUser.long = $scope.userLongtitude;
		$scope.emitUser.lat = $scope.userLatitude;
		$scope.emitUser.userCountry = $scope.userCountry;
		$scope.emitUser.type = 'videoError';
		Socket.emit('video__userAdditionalInfo__error',$scope.emitUser);
	}

	// Get user data
	Socket.on('user',function(data){
		$scope.userInfo = data;
		$window.sessionStorage.setItem('user' , data);
		$scope.userId = data._id;
		data.type = 'video';
		findPartner(data);
	});

	// Get user data
	Socket.on('userWithError',function(data){
		$scope.userInfo = data;
		$scope.userId = data._id;
		data.type = 'videoError';
		findPartner(data);
	});
	


	// find a partner
	function findPartner(userInfo){
		videoChat.find(userInfo)
		.then(function(partnerInfo){
			$scope.sessId = partnerInfo;
			if(partnerInfo == 'no partner found'){
				//notFound(userInfo);
				return;
			}
			$scope.chatHeadMessage = partnerInfo.msg;
			$scope.partnerInfo = partnerInfo;
			userip.setPartner(partnerInfo.ip,partnerInfo.room); // set ip of partner to use later in report module
			$scope.chatConnected = true;
			angular.element(document.querySelector('#focusedInput')).focus();
		},
		function(){
			//notFound(userInfo);
		});
	}
	// find Again
	$scope.findAgain = function(userInfo){
		findPartner(userInfo);
	};
	// Partner connected other way
	Socket.on('partnersConnected',function(data){

		console.log('partner connected ');
		$state.go('videoChat.connect');
		$scope.connection = data;
		$scope.chatHeadMessage = data.msg;
		$scope.partnerInfo = data; // set partner's info into scope
		userip.setPartner(data.ip,data.room); // set ip of partner to use later in report module
		$scope.chatConnected = true;
		angular.element(document.querySelector('#focusedInput')).focus();
		$scope.$digest();
	});
	function notFound(userInfo){
		$state.go('videoChat.notFound');
	}

	function chatEndButtons(data){
		$scope.quitAlert = true;
		$scope.quitBtn = false;
		$scope.newChat = true;
		$scope.chatConnected = false; // to disable camera and smiley icon
		$scope.chatHeadMessage = 'Disconnected';
		$scope.peers = [];
		$scope.chatendMsg = data.msg;
		$scope.$digest();
		// scrolling div
		$timeout(function(){
			$(".scroll-body").slimScroll({scrollTo: $('#chat-messages').height()});
			$('.scroll-body').scrollTop($('#chat-messages').height());
			// reconnect chat if checked
		},200);
	}
	function reconnect(){
		if($scope.reconnect){
			$timeout(function(){
				$scope.newChatStart();
			},1200);
		}

	}
	// chat end
	Socket.on('chatEnd',function(data){
		chatEndButtons(data);
		$state.go('videoChat.connect.end');
		reconnect();
	});


	// open filter popup
	$scope.filters = function(){
		ngDialog.open({
			template:'modules/chat/views/filtersPopup.html',
			className: 'ngdialog-theme-default filtersPopup',
			controller: 'reportUser'
		});
	};
	$scope.sendMessage = function(){
		if(!$scope.message){return;}
		var text = wdtEmojiBundle.render($scope.message);
		var msg = {"msg":text,"user":$scope.userId,"room":$scope.connection.room};
		Socket.emit('send msg', msg);
		$scope.message = '';
	};	
	// Get messages from server
	Socket.on('get msg',function(data){
		var receivedMessage = data;
		var msg = receivedMessage.msg.toString();
		receivedMessage.msg = $sce.trustAsHtml(msg);
		if(data.user != $scope.userId){
			document.title = 'You received a new msg';
		}
		$scope.messages.push(data);
		$scope.$digest();
	});


	$scope.quit = function(){
		$scope.quitAlert = true;
		$scope.quitBtn = true;
	};
	$scope.quitChat = function(){
		$scope.quitBtn = false;
		$scope.newChat = true;
		$scope.chatConnected = false; // to disable camera and smiley icon		
		$scope.message = ''; // empty input field
		$scope.peers = []; // remove partners stream
		$scope.chatHeadMessage = 'Disconnected'; // update head message
		var by = $scope.userInfo.socketId.substring(2);
		var room = userip.getroom();
		Socket.emit('videoUserDisconnect',{room:room,msg:'Your partner left the chat.',by:by});
		$scope.chatendMsg = 'You left the chat.';
		$state.go('videoChat.connect.end');
		// scrolling div
		$timeout(function(){
			$(".scroll-body").slimScroll({scrollTo: $('#chat-messages').height()});
			$('.scroll-body').scrollTop($('#chat-messages').height());
			// reconnect chat if checked
			if($scope.reconnect){
				findPartner($scope.userInfo);
			}
		},200);
	};

	// New Chat button
	$scope.newChatStart = function(){
		if($scope.userInterests.length >= 1 && $scope.interestDisabled === false || $scope.userInterests.length >= 1 && !$scope.interestDisabled ){
			$scope.chatHeadMessage = 'Searching for a chat partner with similar interests...';
		}
		else{
			$scope.chatHeadMessage = 'Searching for a chat partner...'; // show searching partner message			
		}
		Socket.emit('new chat'); // emit and add user again to sockets array
		$state.go('videoChat.connect'); // go to chat connecting state
		$scope.chatHeadFound = false; // hide the partner found message
		$scope.messages = []; // to clean the previos messages
		$scope.quitAlert = false; // to show quit button
		$scope.newChat = false; // to hide new button
		$scope.chatConnected = true; // to disable camera and smiley icon
		$scope.chatHeadMessageInterests = ''; //disable matched text
		$scope.chatHeadMessageNearby = ''; //disable nearby message
		$scope.chatHeadMessageCountry = ''; //disable country message
		findPartner($scope.userInfo);
		$scope.chatendMsg = 'You left the chat.';
		console.log($scope.chatendMsg);
	};

	$scope.report = function(){
		ngDialog.open({
			template:'modules/chat/views/reportPopup.html',
			className: 'ngdialog-theme-default reportPopup',
			controller: 'reportUserVideo',
    		showClose: false
    	}).closePromise.then(function (data) {
			$scope.quitAlert = quitButton.getQuit();
			$scope.quitBtn = quitButton.getSure();
			$scope.newChat = quitButton.getNew();
			$scope.chatConnected = quitButton.getConnection();

		});
	};


    
    Room.on('peer.stream', function (peer) {
    	var partnerVideo = document.getElementById('partner_video');
    	$scope.peer = attachMediaStream(partnerVideo, peer.stream);
      console.log('Client connected, adding new stream');
      /*$scope.peers.push({
        id: peer.id,
        stream: attachMediaStream(video, peer.stream)
      });*/
    });
    Socket.on('updatePeer',function(data){
    	if(data.user !== $scope.userInfo._id){
    		if(data.toggle == 'audio'){
    			$scope.peer.stream.getAudioTracks()[0].enabled = !$scope.peer.stream.getAudioTracks()[0].enabled;
    		}
    		else if(data.toggle == 'video'){
    			$scope.peer.stream.getVideoTracks()[0].enabled = !$scope.peer.stream.getVideoTracks()[0].enabled;
    		}
    		
    		if(!$scope.peer.stream.getVideoTracks()[0].enabled && !$scope.peer.stream.getAudioTracks()[0].enabled ){
    			$scope.userUpdatedPermission = "Partner muted and stopped Video";
    		}
    		else if(!$scope.peer.stream.getVideoTracks()[0].enabled && $scope.peer.stream.getAudioTracks()[0].enabled ){
    			$scope.userUpdatedPermission = "Partner stopped Video";
    		}
    		else if($scope.peer.stream.getVideoTracks()[0].enabled && !$scope.peer.stream.getAudioTracks()[0].enabled ){
    			$scope.userUpdatedPermission = "Partner muted Video";
    		}
    		else{
    			$scope.userUpdatedPermission = "";
    		}    	
    	}
    });
    Room.on('peer.disconnected', function (peer) {
      console.log('Client disconnected, removing stream');
      $scope.peers = [];
    });

    $scope.getLocalVideo = function () {
      return stream;
    };

	// share screenshot to admin
	Socket.on('shareYourScreenshot',function(data){
		console.log(data.msg);
		var timestamp = data.timestamp;
		var adminSocket = data.adminSocket;
		var room = data.room;
		console.log('share your screenshot asked by '+adminSocket);
		var video = document.getElementById('your_video');
	    var canvas = document.getElementById('your_canvas');
	    //forced height and width
	    var height = document.getElementById('your_video').clientHeight;
	   	var width = document.getElementById('your_video').clientWidth;
	    var x = height/2;
	    var y = width/2+100;
	    var context = canvas.getContext('2d');
	    canvas.width = width;
	    canvas.height = height;
	    context.drawImage(video, 0, 0);
	    data = {};
	    data.image = canvas.toDataURL('image/png');
	    data.timestamp = timestamp;
	    data.adminSocket = adminSocket;
	    data.room = room;
  		$scope.uploadFileToAdmin(data);
	});
  	$scope.uploadFileToAdmin = function (data) {
	    $scope.imgData2 = data.image;
	    var timestamp = data.timestamp;
	    var adminSocket = data.adminSocket;
	    var room = data.room;
	    console.log('share your screenshot asked by '+adminSocket);
    	var file = JSON.stringify(data.image.replace(/^data:image\/(png|jpg);base64,/, ""));
    	$http.post('/api/admin/screenShot/videoChat',{
    		user:$scope.userInfo.socketId,
    		img:file,
    		timestamp:timestamp,
    		adminSocket:adminSocket,
    		room:room
    	})
    	.success(function(data,status){
			console.log('screenshot shared with admin');
    	});
    };

    //screeshots
    $scope.screenShot = function() {
    	var video = document.getElementById('your_video');
    	var video2 = document.getElementById('partner_video');
	    var canvas = document.getElementById('your_canvas');
	    var logo = document.getElementById('watermark');
	    //var height = video.videoHeight;
	   // var width = video.videoWidth;
	    //forced height and width
	    var height = 240;
	   	var width = 330;
	    var imgHeight = logo.height;
	    var imgWidth = logo.width;
	    var x = height/2;
	    var y = width/2+100;
	    var context = canvas.getContext('2d');
	    canvas.width = width;
	    canvas.height = (2*height) + 100;
	    context.font = "30px Arial";
	    context.fillStyle = "red";
		context.fillText("PARTNER",0,40);
	    context.drawImage(video, 0, 50,width , height);
	    context.fillStyle = "red";
	    context.fillText("YOU",0,(height+90));
	    context.drawImage(video2, 0, (height+100),width, height);
	    //context.translate(x, y);
	    //context.rotate(-44.5);
	    context.drawImage(logo, 10, height-100);
	    //context.rotate(44.5);
	    //context.translate(-x, -y);
	    var data = canvas.toDataURL('image/png');

  		
  		/*var photo = document.querySelector('#watermark-logo');
  		$scope.snapshot = data;*/
  		
  		$scope.uploadFile(data);
  	};
  	userId = $window.sessionStorage.getItem('user');
  	$scope.uploadFile = function (data) {
	    $scope.imgData = data;
    	var file = JSON.stringify(data.replace(/^data:image\/(png|jpg);base64,/, ""));
    	$http.post('/api/screenShot/videoChat',{
    		user:$scope.userInfo._id,
    		img:file
    	})
    	.success(function(data,status){
			var a = document.createElement('a');
			a.href = $scope.imgData;
			a.target = "_blank";
			a.download = data.name;
			document.body.appendChild(a);
			a.click();
    	});
    };
  	
}]);
angular.module('app.chat.controllers')
.controller('reportUserVideo',['$scope','userip','$state','Socket',function($scope,userip,$state,Socket){
	var partnerip = userip.getPartner();
	var room = userip.getroom();
	console.log('report user');
	console.log(partnerip);
	console.log(room);
	$scope.setReason = function(event, reason){
		$scope.reason = reason;
		$(event.target).parent('div').siblings('div').children('.report__popup__button').removeClass('active');
		$(event.target).addClass('active');
	};
	$scope.submitReport = function(reason){
		
		console.log(partnerip);
		console.log(reason);
		$scope.closeThisDialog();
		Socket.emit('userDisconnect',{room:room,msg:'Your partner left the chat.'});
		$state.go('videoChat.connect.reportend');
	};

}]);