angular.module('kosmochat')

.controller('FilterCtrl',['$rootScope','$scope','$state','filter','$http','userip','userBan',
	function($rootScope,$scope,$state,filter,$http,userip,userBan){
		console.log('Hi '+userBan.getstatus());
		// verify user's ip
		var ip = 'https://api.ipify.org/?format=json';
		$http.get(ip).then(function(ipL){
			$scope.userIP = ipL.data.ip;
			userip.set($scope.userIP);
			// verify ip from the backend
			$http.post('/api/verifyIp',{ip:$scope.userIP})
			.success(function(data){
				if(data == 'banned'){
					$scope.ban = true;
				}
				else{  
				}
			})
		})	
	$scope.$state = $state;
	// set chat filter
	$scope.setFilter = function(filterType,interestDisabled,filterValue){
		// check whether user select a country or throw error
		if(filterType === 'country' && !filterValue){
			console.log('country not selected');
			$scope.countryValidate = true;
			return;
		}
		filter.set(filterType,interestDisabled,filterValue);
		$state.go('chat.connect');
	};
	// set video chat filter
	$scope.videoChatFilter = function(filterType,interestDisabled,filterValue){
		filter.set(filterType,interestDisabled,filterValue);
		$state.go('videoChat.connect'); 
	}
	// Interests code
	// interestAdded
	$scope.interestInputFocus; // to add border on input box
	$scope.interestText = ''; // text of the input field
	$scope.smallInput = true; // input without text
	$scope.allInterests = filter.getI(); // get all interests from the factory

	// if there are no interests added by user
	if($scope.allInterests.length == 0){
		$scope.interestText = 'Add interest (press Enter to confirm an interest)';
		$scope.smallInput = false;
	}
	else{
		$scope.interestText = '';
		$scope.smallInput = true;
	}	
	$scope.interestDisabled = filter.GetD();
	$scope.interestAdded = function(){
		if(!$scope.interest){return}
		var interest = $scope.interest;
		var n = interest.indexOf("#");
		// if interest already contains a #
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
	}
	// ser disable interest
	$scope.disableInterest = function(){
		$scope.interestDisabled=!$scope.interestDisabled;
		filter.setD($scope.interestDisabled);
	}
	// remove interest
	$scope.removeInterest = function(interest){
		console.log('removed '+interest);
		filter.removeInt(interest);
		if($scope.allInterests.length == 0){
			$scope.interestText = 'Add interest (press Enter to confirm an interest)';
			$scope.smallInput = false;
		}
		else{
			$scope.interestText = '';
			$scope.smallInput = true;
		}
	}
	// Interests code
	$scope.countries = [];
	$http.get('assets/data/countries.json')
	.then(function(res){
		$scope.countries = res.data;
		$scope.selectedCountry = $scope.countries[0];
	})
}])