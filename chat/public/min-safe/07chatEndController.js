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