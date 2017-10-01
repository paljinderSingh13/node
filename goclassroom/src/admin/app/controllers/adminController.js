app
	.controller('adminLoginCtrl', ['$rootScope', '$scope', '$state', '$window', 'adminService', 'toast', 
		function($rootScope, $scope, $state, $window, adminService, toast){

			// login function
			$scope.doLogin = function(formDetails){

				adminService.login(formDetails)
					.then(function (res){
						if(res.data.success){
							$window.localStorage.ud_ad_classrooms = res.data.details;
							toast.show(res.data.message, 'success')
							$state.go('master.dashboard');
						} else {
							toast.show(res.data.message, 'danger')
						}

					})

			}

			// logout function
			$scope.logout = function logout(){

				$rootScope.admin = '';

				$window.localStorage.removeItem('ud_ad_classrooms');

				$state.go('/');

				toast.show('Logged out successfully', 'danger');

			}
		}])
	.controller('adminCtrl', ['$rootScope', '$scope', '$state', '$stateParams','$window', 'adminService', 'toast', '$filter', 'alertBox',
		function($rootScope, $scope, $state, $stateParams, $window, adminService, toast, $filter, alertBox){

			
			// getting admin api's
			if(!$rootScope.allGroups && $rootScope.allGroups == undefined){

				$rootScope.allGroups = [];
				// getting all goup list 
				adminService.getAllGroups()
					.then(function (res){
						//console.log(res);
						$rootScope.allGroups = res.data;
						
				})

			}

			if(!$rootScope.allInst && $rootScope.allInst == undefined){

				$rootScope.allInst = [];
				// getting all goup list 
				adminService.getAllInst()
					.then(function (res){
						//console.log(res);
						$rootScope.allInst = res.data;
						
				})

			}

			// action button click handler
			$scope.getGroupData = function(groupId, event){
				
				if(event == 'details'){

					$state.go('master.groupdetails',{'groupId':groupId});

				} else if(event == 'edit'){

					$state.go('groups.edit',{'groupId':groupId});

				}

			}

			// action button click handler
			$scope.getInstData = function(groupId, event){
				
				if(event == 'details'){
					
					$state.go('master.instdetails',{'groupId':groupId});

				} else if(event == 'edit'){

					$state.go('institutes.edit',{'groupId':groupId});

				}

			}

			// watcing the changes to rootscope and filter wrt groupid
			$rootScope.$watch(function (rootScope){

				return rootScope.allInst;

			}, function (newValue, oldValue){

				// if group id occurs in state params
				if($stateParams.groupId && newValue.length > 0){
					
					var data = $filter('filter')(newValue,{_id : $stateParams.groupId},true);
					$scope.group = data[0];
					
				}

			})

			$scope.formDetails = {};
			// approve institute
			$scope.approve = function(formDetails){
				
				alertBox.confirmAlert()
					.then(function (){
						
						formDetails._id = $scope.group._id;
						
						adminService.approveInstitute(formDetails)
							.then(function (res){
								if(res.data.success){
									toast.show(res.data.message, 'success');
									$scope.group.isApproved = true;
									$state.go('master.dashboard');
								} else {
									toast.show(res.data.message, 'danger');
								}
							})
				})
		
			}
		
		}])