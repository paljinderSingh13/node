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