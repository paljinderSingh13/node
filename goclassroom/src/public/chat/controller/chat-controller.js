angular.module('chat')
.controller('chatController',['$scope','$http','$rootScope','$filter','Socket','ngDialog','$sce','Upload','$state','$mdDialog','$filter','$timeout',function($scope,$http,$rootScope,$filter,Socket,ngDialog,$sce,Upload,$state,$mdDialog,$filter,$timeout){
	
	$scope.availableChat=[];
	$scope.emitTo = {
		'_id' : 0
	};
	$scope.selectedIndex;

	$scope.user = $rootScope.user;
	$scope.chatGroups = [];


	//get all available chat partners
	$http.get('/availablechatpartner').success(function(data){
		//console.log(data)

		data.users.push(data.group[0])
		
		data.users.map(function(ele, idx) {
			if(ele){

				var el = ele;
				//console.log(el);
				el.notification = 0;
				$scope.availableChat.push(el);
			}
			
		})
		if(data.group[0]){

			$scope.chatGroups.push(data.group[0]._id);
		}

		

	})

	//get all available chat groups
	/*$http.get('/availablechatgroups').success(function(data){
		console.log(data)
		for(var item of data){

			$scope.chatGroups.push(item._id);

			$scope.availableChat.push(item);
		}
	})*/

	//get all unread messages
	$scope.$watch(( scope )=>{
		return scope.availableChat
	},(newValue, oldValue)=> {

		$http.post('/unreadmessages',{user:$scope.user}).success( (data)=>{
			//console.log(data)
			data.map((ele, idx)=> {
				//return something;
				console.log(ele.count)
				var currentPartner = $filter('filter')($scope.availableChat,{'_id':ele._id}, true)[0];

				$scope.availableChat[$scope.availableChat.indexOf(currentPartner)].notification = ele.count;
			
			})
			if($scope.availableChat.length > 0){

				var moreMessages = $scope.availableChat.reduce(function(pv,cv,ci,arr){
					if(pv.notification > cv.notification){
						return pv;
					}
					else{
						return cv;
					}
				})
			}
			//$scope.setChatTo($scope.availableChat[0],0)

		})
	})
	

	$scope.messages = [];
	$scope.message = {}
   
   	//send message
	$scope.sendMessage = function(){
		if(this.details != null){
			var currentTime = new Date().toISOString();

			//currentTime = $filter('date')(currentTime,'medium',"ISO")

			//convert to emoji
			var emojiEncode = wdtEmojiBundle.render(this.details)
			//convert to html readable text
			var emojiDecode = $sce.trustAsHtml(emojiEncode)

			var sender = {
				id 	  :  $scope.user._id,
				fullname  :  $scope.user.fullname
			}

			if($scope.emitTo.members){

				$scope.messages.push({message:emojiDecode,receiver:$scope.emitTo,sender:sender,createdAt:currentTime,isGroup:true});	

				Socket.emit('msg',{message:emojiEncode,receiver:$scope.emitTo,sender:sender,createdAt:currentTime,isGroup:true});
			}
			else{

				$scope.messages.push({message:emojiDecode,receiver:$scope.emitTo,sender:sender,createdAt:currentTime,isGroup:false});	

				Socket.emit('msg',{message:emojiEncode,receiver:$scope.emitTo,sender:sender,createdAt:currentTime});
			}

			this.details = null;

			//close emojipicker 
			var emojiList = document.querySelector('.wdt-emoji-popup');
			emojiList.classList.remove("open");
		}
	}

	$scope.closePicker = ()=>{
		var emojiList = document.querySelector('.wdt-emoji-popup');
		emojiList.classList.remove("open");
	}

	//on socket listen p2p chat
	Socket.on('msg',function(data){

		if(data.sender.id != $scope.user._id && data.receiver.id == $scope.user._id ){

			var receivedMessage = data;

			//convert to html readable text
			receivedMessage.message = $sce.trustAsHtml(receivedMessage.message);

			if($scope.emitTo._id == data.sender.id){
				//var userAvailable =  $filter('filter')($scope.availableChat,{_id:data.sender.id},true)

				$scope.messages.push(data);
				
				$scope.$digest();

			}
			else{

				$scope.availableChat.map((elem, index) => {
					if(elem._id == data.sender.id){
						elem.notification ? elem.notification += 1 : elem.notification = 1
					}
				})

			}

		}

		$scope.goToBottom();

	})

	//on socket listen group chat 
	Socket.on('groupmsg',function(data){
		//console.log($scope.chatGroups.indexOf(data.groupId))
		//console.log(data.groupId)
		//console.log(data.sender.id != $scope.user._id)
		//console.log($scope.chatGroups)
		if(data.sender.id != $scope.user._id && $scope.chatGroups.indexOf(data.groupId) > -1 ){
			
			console.log('group ******************************')
			var receivedMessage = data;

			receivedMessage.message = $sce.trustAsHtml(receivedMessage.message);

			receivedMessage.isGroup = true;

			//console.log($scope.emitTo._id)

			if($scope.emitTo._id !== data.groupId){

				$scope.availableChat.map((elem, index) => {
					if(elem._id == data.groupId){
						elem.notification ? elem.notification += 1 : elem.notification = 1
					}
				})

			}
			else{
				
				$scope.messages.push(data);
				
				$scope.$digest();
			}
		}	
		$scope.goToBottom();
	})


	//set chat to a user and get all history
	$scope.setChatTo = function(emitTo,$index){

		//angular.element()

		$scope.emitTo = emitTo;
		
		$scope.selectedIndex = $index;

		$scope.availableChat.map((elem, index) => {
			if(elem._id == $scope.emitTo._id){
				elem.notification = 0;
			}
		})
		
		if($scope.emitTo.members){

			$scope.emitTo.isGroup = true;

			$http.post('/groupmessages',{groupId:emitTo._id,user:$scope.user}).success(function(data){

				//console.log(data)
				//console.log(emitTo._id)
				if(data != null || data != "" || data != undefined){

					for(var item of data){
						item.message = $sce.trustAsHtml(item.message);
						item.isGroup = true;
					}
				}
				$scope.messages = data;
				
				$timeout(() =>{

					$scope.goToBottom();

				},10)
			})		

		}
		else{

			$scope.emitTo.isGroup = false;

			$http.post('/usermessages',{partner:emitTo._id,user:$scope.user._id}).success(function(data){
				if(data != null || data != "" || data != undefined){

					for(var item of data){
						item.message = $sce.trustAsHtml(item.message);
						item.isGroup = false;
					}
				}
				//console.log(data)
				$scope.messages = data;

				$timeout(() =>{

					$scope.goToBottom();

				},10)
			})

		}
		var emojiList = document.querySelector('.wdt-emoji-popup');
		emojiList.classList.remove("open");

	}

	$scope.goToTop = () => {

		$( ".messages-window" ).scrollTop( 0 );

	}

	$scope.goToBottom = () => {

		$( ".messages-window" ).scrollTop( $scope.messageScroll() );

	}
	$scope.messageHeight;
	$scope.messageScolled;
	$scope.messageScroll = () => {

		$scope.messageHeight = $('.chat-messages').height();
		return $scope.messageHeight;
	}

	$scope.messagePos = ()=>{
		$scope.messageScolled = $( ".messages-window" ).scrollTop();
		return $scope.messageScolled;
	}

	//send photo
	$scope.uploadFile = function (file) {

		var currentTime = new Date().toISOString();

		//currentTime = $filter('date')(currentTime,'medium',"UTC");

		var sender = {
			id 	  :  $scope.user._id,
			fullname  :  $scope.user.fullname
		}


        Upload.upload({
            url: '/upload', //webAPI exposed to upload the file
            data:{receiver:$scope.emitTo,sender:sender,createdAt:currentTime},
            file:file
         }).then(function (resp) { 

          	//convert to emoji
			var imgEncode = wdtEmojiBundle.render(resp.data.filename)
			//convert to html readable text
			var imgDecode = $sce.trustAsHtml(imgEncode)
			//console.log(resp)

			if($scope.emitTo.members){

				$scope.messages.push({message:'',receiver:$scope.emitTo,sender:sender,createdAt:currentTime,isGroup:true,filename:imgEncode});	

			}
			else{

				$scope.messages.push({message:'',receiver:$scope.emitTo,sender:sender,createdAt:currentTime,isGroup:false,filename:imgEncode});	

			}

         }, function (resp) { 

           console.log('Error status: ' + resp.status);
           
         }, function (evt) { 
            
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ');
        });

    };
   
   	//open photo
   	$scope.openPhoto = function(file,ev){


		$scope.filePath = "uploads/" +file;
	    $mdDialog.show({
	      controller: openImage,
	      templateUrl: 'chat/views/open-photo.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:true,
	      resolve:{
	      	imgPath : function(){
	      		return $scope.filePath;
	      	}
	      },
	      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
	    })
	    .then(function(answer) {
	      $scope.status = 'You said the information was "' + answer + '".';
	    }, function() {
	      $scope.status = 'You cancelled the dialog.';
	    });
	  
	}
	function openImage($scope, $mdDialog, imgPath) {
		console.log(imgPath)
		$scope.getUserImg = imgPath;
	    $scope.hide = function() {
	      $mdDialog.hide();
	    };

	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    };

	    $scope.answer = function(answer) {
	      $mdDialog.hide(answer);
	    };
  	}
	

	
	//group variables
	$scope.group = {};
	$scope.group.members = [];
	//add group members
	$scope.addGroupMember = function(id){
		if($scope.group.members.indexOf(id) == -1){
			$scope.group.members.push(id)
		}
		else{
			$scope.group.members.splice($scope.group.members.indexOf(id), 1);
		}
	}
	//check if the member is added to the group
	$scope.addedMember = function(id){
		return $scope.group.members.indexOf(id) > -1;
	}
	//clear selected member
	$scope.clearMembers = function(){
		$scope.group.members = [];
	}
	//create group
	$scope.createGroup = function(){
		$scope.group.members.push($scope.user._id)
		$http.put('/creategroup',{group:$scope.group,createdBy:$scope.user._id}).success(function(res){
			console.log(res);
		})
	}


}])
.controller('chatEmoji',['$scope','$timeout',function($scope,$timeout){

	/*============================
	===		 emoji picker      ===
	==============================*/

	wdtEmojiBundle.init('.wdt-emoji-bundle-enabled');
	wdtEmojiBundle.fillPickerPopup();

	$scope.emojiPopUp = function(){
		wdtEmojiBundle.fillPickerPopup();
		wdtEmojiBundle.openPicker();
		var emojiList = document.querySelector('.wdt-emoji-popup');
		document.querySelector('.wdt-emoji-bundle-enabled').focus();
		emojiList.classList.toggle("open");


	}
	$scope.escPicker = function(ev){
		if(ev.keyCode === 27){
			var emojiList = document.querySelector('.wdt-emoji-popup');
			emojiList.classList.remove("open");
		}
	}

}])
