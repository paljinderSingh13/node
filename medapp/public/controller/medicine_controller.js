var medicine = angular.module("medicine",[]);

	medicine.controller('medicine',function($scope, $http){

		$scope.medicine = "medicine app";

		$scope.addMedicine = function()
		{
			console.log($scope.med);
			$http.post('/add_medicine',$scope.medicine).success(function(response){
			console.log(response);

			});
		}

	});