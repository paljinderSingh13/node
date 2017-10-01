var myApp = angular.module("myApp",[]);

		myApp.controller('mycont',function($scope, $http){

			var refresh  = function(){
	 				$http.get('/get_medicine').then(function(response){
						$scope.medicine_data = response.data;
						$scope.med ="";
					});

					$http.get('/get_medicine_shop').then(function(response){
						$scope.medicine_shop = response.data;
						
					});
			
					}
				
				refresh();

			$http.get('/rolelist').then(function(response){ 
				console.log("get res data ");
			    $scope.rolelist = response.data; 
			});﻿

			
		$http.get('/contactlist').then(function(response){ 
				console.log("get res data ");
			    $scope.contactList = response.data; 
			});﻿

			$scope.names ="waheguru";
////----------------------Link Medicine to Medical sho & price -----------------///

	$scope.addPrice = function()
	{
				console.log($scope.rate);
		$http.post("/addPrice",$scope.rate ).success(function(response){
			console.log(response);	
		})
	}

////----------------------End Link Medicine to Medical sho & price -----------------///


//////-----------------------------------Medicine script start here ------------------------------///
		$scope.remove_medicine = function(id)
		{
			//console.log(id);
			$http.get('/remove_medicine/'+id).success(function(response)
			{
				//alert("remove");
				refresh();
				console.log(response);
			})
		}

		$scope.addMedicine = function()
				{
			console.log($scope.med);
			$http.post('/add_medicine',$scope.med).success(function(response){

					
						refresh();

					})
			}
	

			$scope.edit_medicine = function (id)
			{
					$http.get('/edit_medicine/'+id).success(function(response){

					$scope.med = response;

					})
					
					console.log(id);
			}

			$scope.update_medicine = function ()
			{

					console.log($scope.med._id);

					$http.put('/medicine/'+$scope.med._id , $scope.med).success(function(response)
								{	
										refresh();
										console.log("update medicine");
								});

			}

//////-----------------------------------Medicine script End here ------------------------------///


			$scope.myfunction = function()
			 {
			 		//console.log($scope.user);
			 		$http.post('/contactlist', $scope.user).success(function(response){
						console.log(response);
			 		});
			 } 

			$scope.createRole = function()
			{
				$http.post('/createRole', $scope.role).success(function(response){

					$scope.resp = response;
						console.log(response);
			 		});
			}

			$scope.remove_user = function(id)
			{
				$http.delete('/removeuser/'+id);
			}

			$scope.edit_user = function(id)
			{
				$http.get('/user_edit/'+id, function(response){

					$scope.user =response;

				});
			}

		});