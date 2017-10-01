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