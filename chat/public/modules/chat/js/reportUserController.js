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