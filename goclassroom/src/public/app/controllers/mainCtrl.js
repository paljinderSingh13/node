app
	// user controller
	.controller('userCtrl', ['$rootScope', '$window', '$scope', '$state', 'toast', 'userService', 
		function ($rootScope, $window, $scope, $state, toast, userService) {
			
			// redirect function
			$scope.goto = function(goto){
				//console.log('asdfasfdasdf');
				$state.go(goto);

			}

			// logout function
			$scope.logout = function logout(){

				$rootScope.user = '';

				$window.localStorage.removeItem('ud_classrooms');

				$state.go('/');

				toast.show('Logged out successfully', 'danger');

			}

			// updating user profile
			$scope.update = function(formDetails){

				userService.updateProfile(formDetails)
					.then(function(res){

						console.log(res);

				})

			}

			// change password
			$scope.changePassword = function(formDetails){

				console.log(formDetails);
	
				if(formDetails.newPassword != formDetails.confNewPassword){

					toast.show("Password dosen't match. Please try again", 'danger', 3000);

				} else {

					userService.changePassword(formDetails)
				 	.then(function (res){

				 		console.log(res);

				 	})

				}			
			}

	}])

	// dashboard controller
	.controller('dashboardCtrl', ['$scope', '$state', 'toast',
		function ($scope, $state, toast) {
		
		// dashboard content

	}])

	// groups controller
	.controller('groupsCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'groupService', 'toast', 'alertBox', '$filter',
		function ($rootScope, $scope, $state, $stateParams, groupService, toast, alertBox, $filter) {
		
		// setting up labels
		if($rootScope.user.role == 1 || $rootScope.user.role == 2){

			$rootScope.label = 'Institute';

		} else {

			$rootScope.label = 'Group';

		}

		// setting up group rootscope variable 
		if(!$rootScope.groups && $rootScope.groups == undefined){

			$rootScope.groups = [];
			// getting goup list 
			groupService.list()
				.then(function (res){
					//console.log(res);
					$rootScope.groups = res.data;

					// allow the user to add more groups on user type basis
					var check = $filter('filter')($rootScope.groups, {'isApproved' : false}, true)[0];
					if(check){
						$scope.canAdd = false;
					} else {
						$scope.canAdd = true;
					}

			})


		}
		

		// watcing the changes to rootscope and filter wrt groupid
		$rootScope.$watch(function (rootScope){

			return rootScope.groups;

		}, function (newValue, oldValue){

			// if group id occurs in state params
			if($stateParams.groupId && newValue.length > 0){
				
				var data = $filter('filter')(newValue,{_id : $stateParams.groupId},true);

				$scope.formDetails 	= data[0];
				$scope.group 		= data[0];

			}

			// allow the user to add more groups on user type basis
			var check = $filter('filter')($rootScope.groups, {'isApproved' : false}, true)[0];
			if(check){
				$scope.canAdd = false;
			} else {
				$scope.canAdd = true;
			}
		})

		// action button click handler
		$scope.getData = function(groupId, event){
			
			if(event == 'details'){

				$state.go('groups.details',{'groupId':groupId});

			} else if(event == 'edit'){

				$state.go('groups.edit',{'groupId':groupId});

			}

		}

		// checking availability for the group unique id
		$scope.isGroupAvailable = function(unid){
			
			if(unid){
				
				groupService.checkavailability(unid).then(function (res){

					if(!res.data.success){

						toast.show(res.data.message, 'danger', 3000);

						$scope.formDetails.unid = '';
					}
	
		 	 	})
			} 
		 
		}

		// saving group
		$scope.save = function(formDetails){

			groupService.saveGroup(formDetails).then(function (res){
				
				toast.show(res.data.message, 'success', 3000);

				$rootScope.groups.unshift(res.data.details);

				$state.go('groups.list');

			})

		}

		// update subject
		$scope.update = function (formDetails){

			groupService.update(formDetails)
				.then(function (res){

					if(res.data.success){

						var item = $filter('filter')($rootScope.groups, { '_id' : formDetails._id  }, true)[0];
			
						$rootScope.groups[$rootScope.groups.indexOf(item)] = formDetails;
						
						toast.show(res.data.message, 'success', 2000);
						
						$state.go('groups.list');
					
					} else {
						toast.show(res.data.message, 'danger', 2000);
						
					}

				})

		} 

		// handeling delete event 
		$scope.delete = function (groupId){
			
			alertBox.confirmAlert()
				.then(function (){

					groupService.delete({'_id':groupId}).then(function(res){
						
						if(res.data.success){
							
							var item = $filter('filter')($rootScope.groups, { '_id' : groupId  }, true)[0];
							// removing groups and subjects array from rootscope
							$rootScope.groups.splice($rootScope.groups.indexOf(item), 1);
							
							if($rootScope.classes){
								// removing sections from rootscope wrt removed group
								var cls = $filter('filter')($rootScope.classes, { 'groupId' : groupId }, true)[0];
								$rootScope.classes.splice($rootScope.classes.indexOf(cls), 1);
							}
							
							toast.show(res.data.message, 'success', 2000);

							$state.go('groups.list');

						} else {
							
							toast.show(res.data.message, 'danger', 2000);
							
						}

					})

				})
			
		}

	}])

	// subject controller
	.controller('subjectCtrl', ['$rootScope','$scope', '$state', '$stateParams', 'subjectService', 'groupService', 'classService', 'toast', 'alertBox', '$filter',
		function ($rootScope, $scope, $state, $stateParams, subjectService, groupService, classService, toast, alertBox, $filter){
			
			// setting up labels
			if($rootScope.user.role == 1 || $rootScope.user.role == 2){

				$rootScope.label = 'Institute';

			} else {

				$rootScope.label = 'Group';

			}
			// setting up checkboxes
			$scope.items = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
			$scope.selected = [];
			$scope.toggle = function (item, list) {
		    	var idx = list.indexOf(item);
		        
		        if (idx > -1) {
		          list.splice(idx, 1);
		        } else {
		          list.push(item);
		        }
		    };

		    $scope.exists = function (item, list) {
		    	return list.indexOf(item) > -1;
		    };

		    // setting up durations
		    $scope.durations = ['Month(s)', 'Week(s)', 'Day(s)'];

		    // toggle fee checkbox
		    $scope.toggleFee = function(){

		    	

		    }
			// setting up group rootscope variable 
			if(!$rootScope.groups && $rootScope.groups == undefined){

				$rootScope.groups = [];
				// getting goup list 
				groupService.list()
					.then(function (res){
						
						$rootScope.groups = res.data;

				})

			}

			// setting up classes aka subjects rootscope variable 
			if(!$rootScope.subjects && $rootScope.subjects == undefined){

				$rootScope.subjects = [];
				
				// getting goup list 
				subjectService.getSubjectList()
					.then(function (res){
						
						$rootScope.subjects = res.data.details;


				})

			}
			
			// watcing the changes to rootscope and filter wrt groupid
			$rootScope.$watch(function (rootScope){
					//console.log($rootScope.subjects);
				return rootScope.subjects;


			}, function (newValue, oldValue){
				
				if($stateParams.subjectId && newValue.length > 0){
					
					var data = $filter('filter')(newValue,{_id : $stateParams.subjectId},true);
					
					$scope.subject 				= data[0];
					
					$scope.subject.group_id 	= data[0].groupId._id;

					$scope.selected 			= data[0].weekdays;
					
				} 

			})
			
			// action button click handler
			$scope.getData = function(subjectId, event){

				if(event == 'details'){

					$state.go('classes.details',{'subjectId':subjectId});

				} else if(event == 'edit'){

					$state.go('classes.edit',{'subjectId':subjectId});

				}

			}

			// check subject if available
			$scope.checkavailability = function (formDetails){

				subjectService.checkavailability(formDetails)
					.then(function (res){
					
					if(!res.data.success){

						toast.show(res.data.message, 'danger', 3000);

						$scope.formDetails.subid = '';
					}

				})
				
			}
			
			// save subject
			$scope.save = function (formDetails){

				if($scope.selected == ''){

					toast.show('Please select weekdays', 'danger');
				
				} else {
				
					formDetails.weekdays = $scope.selected;

					subjectService.saveSubject(formDetails)
						.then(function (res){
							
							if(res.data.success){

								// updating class lists
								classService.listClasses()
									.then(function (res){

										$rootScope.classes = res.data;

									})

								$rootScope.subjects.unshift(res.data.details);

								toast.show(res.data.message, 'success', 3000);

								$state.go('classes.list');

							} else {

								toast.show('Cannot add Class. Please refresh and try again.', 'danger', 3000);
							}
				 	})
				}

			}

			// update subject
			$scope.update = function (formDetails){

				if($scope.selected == ''){

					toast.show('Please select weekdays', 'danger');
				
				} else {
					
					formDetails.groupId 	= formDetails.group_id;
					formDetails.weekdays 	= $scope.selected;

					//console.log($scope.subject);

					subjectService.update(formDetails)
						.then(function (res){
							
							if(res.data.success){
								var item = $filter('filter')($rootScope.subjects, { '_id' : formDetails._id  }, true)[0];
			
								$rootScope.subjects[$rootScope.subjects.indexOf(item)] = res.data.details;
								
								toast.show(res.data.message, 'success', 2000);
								
								$state.go('classes.list');
							} else {
								toast.show(res.data.message, 'danger', 2000);
								
							}

						})

				}
				

			} 

			// handeling delete event 
			$scope.delete = function (subjectId){

				alertBox.confirmAlert()
					.then(function (){

						subjectService.delete({'_id':subjectId}).then(function(res){
							//console.log(res);
							if(res.data.success){
								var item = $filter('filter')($rootScope.subjects, { '_id' : subjectId  }, true)[0];
			
								$rootScope.subjects.splice($rootScope.subjects.indexOf(item));
								
								toast.show(res.data.message, 'success', 2000);
								$state.go('classes.list');
							} else {
								toast.show(res.data.message, 'danger', 2000);
								
							}

						})

					}).catch( function (){

				
					})
				
			}
	
	}])

	// classes controller
	.controller('classesCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'groupService', 'subjectService', 'classService', 'toast', 'alertBox', '$filter',
		function($rootScope, $scope, $state, $stateParams, groupService, subjectService, classService, toast, alertBox, $filter){

		// setting up labels
		if($rootScope.user.role == 1 || $rootScope.user.role == 2){

			$rootScope.label = 'Institute';

		} else {

			$rootScope.label = 'Group';

		}
		// setting up group rootscope variable 
		if(!$rootScope.groups && $rootScope.groups == undefined){

			$rootScope.groups = [];
			// getting goup list 
			groupService.list()
				.then(function (res){
					
					$rootScope.groups = res.data;

			})

		}

		// setting up classes aka subjects rootscope variable 
		if(!$rootScope.subjects && $rootScope.subjects == undefined){

			$rootScope.subjects = [];
			
			// getting goup list 
			subjectService.getSubjectList()
				.then(function (res){
					
					$rootScope.subjects = res.data.details;


			})

		}
		
		// setting up classes aka subjects rootscope variable 
		if(!$rootScope.classes && $rootScope.classes == undefined){

			$rootScope.classes = [];

			classService.listClasses()
				.then(function (res){

					$rootScope.classes = res.data;

				})
		}
		// watcing the changes to rootscope and filter wrt groupid
		$rootScope.$watch(function (rootScope){
				
			return rootScope.classes;


		}, function (newValue, oldValue){
			
			if($stateParams.classId && newValue.length > 0){
				
				
				var data = $filter('filter')(newValue,{_id : $stateParams.classId},true);
				
				$scope.class			= data[0];

				$scope.class.group_id 	= data[0].groupId._id;

				$scope.class.subject_id = data[0].subjectId._id;

			} 

		})

		// check previous created class
		$scope.checkavailability = function(formDetails){

			classService.checkavailability(formDetails).then(function (res){

				if(!res.data.success){

					toast.show(res.data.message, 'danger', 3000);
					$scope.formDetails.clsid = '';


				}
			})

		}

		// saving class data
		$scope.save = function (formDetails){

			classService.save(formDetails).then(function (res){
				
				if(res.data.success){

					$rootScope.classes.unshift(res.data.details);

					toast.show(res.data.message, 'success');
					$state.go('sections.list');
				}

			})
							
		}

		// action button click handler
		$scope.getData = function(classId, event){
			
			if(event == 'details'){

				$state.go('sections.details',{'classId':classId});

			} else if(event == 'edit'){

				$state.go('sections.edit',{'classId':classId});

			}

		}

		// update subject
		$scope.update = function (formDetails){

			formDetails.groupId 	= formDetails.group_id;
			formDetails.subjectId 	= formDetails.subject_id;

			classService.update(formDetails)
				.then(function (res){
					
					if(res.data.success){

						var item = $filter('filter')($rootScope.classes, { '_id' : formDetails._id  }, true)[0];
			
						$rootScope.classes[$rootScope.classes.indexOf(item)] = res.data.details;
					
						toast.show(res.data.message, 'success', 2000);
					
						$state.go('sections.list');
					} else {
						toast.show(res.data.message, 'danger', 2000);
						
					}

				})

		} 

		// handeling delete event 
		$scope.delete = function (classId){

			alertBox.confirmAlert()
				.then(function (){

					classService.delete({'_id':classId}).then(function(res){
						
						if(res.data.success){
							
							var item = $filter('filter')($rootScope.classes, { '_id' : classId  }, true)[0];
			
							$rootScope.classes.splice($rootScope.classes.indexOf(item));
							
							toast.show(res.data.message, 'success', 2000);
							
							$state.go('sections.list');
						} else {
							toast.show(res.data.message, 'danger', 2000);
							
						}

					})

				}).catch( function (){

			
				})
			
		}

	}])

	// invitation controller
	.controller('invitationsCtrl', ['$rootScope', '$scope', '$state', 'toast', 'subjectService', 'invitationService', 'alertBox', '$mdDialog',
		function ($rootScope, $scope, $state, toast, subjectService, invitationService, alertBox, $mdDialog) {


		  function DialogController($scope, $mdDialog) {
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

		    $scope.showAdvanced = function(ev) {
			    $mdDialog.show({
			      controller: DialogController,
			      templateUrl: 'app/views/base/tmpl/accept.tmpl.html',
			      parent: angular.element(document.body),
			      targetEvent: ev,
			      clickOutsideToClose:true,
			      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			    })
			    .then(function(answer) {
			      $scope.status = 'You said the information was "' + answer + '".';
			    }, function() {
			      $scope.status = 'You cancelled the dialog.';
			    });
			  };

		    $scope.showReportSpam = function(ev) {
			    $mdDialog.show({
			      controller: DialogController,
			      templateUrl: 'app/views/base/tmpl/reportSpam.tmpl.html',
			      parent: angular.element(document.body),
			      targetEvent: ev,
			      clickOutsideToClose:true,
			      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			    })
			    .then(function(answer) {
			      $scope.status = 'You said the information was "' + answer + '".';
			    }, function() {
			      $scope.status = 'You cancelled the dialog.';
			    });
			  };

			    $scope.showConfirm = function(ev) {
				    // Appending dialog to document.body to cover sidenav in docs app
				    var confirm = $mdDialog.confirm()
				          .title('Are you sure?')
				         // .textContent('All of the banks have agreed to forgive you your debts.')
				         // .ariaLabel('Lucky day')
				          .targetEvent(ev)
				          .ok('Yes')
				          .cancel('No');

				    $mdDialog.show(confirm).then(function() {
				      $scope.status = 'You decided to get rid of your debt.';
				    }, function() {
				      $scope.status = 'You decided to keep your debt.';
				    });
				  };

			// gettings grouo and subject list according to the user id
			subjectService.getUserGroupList($rootScope.user._id)
				.then(function (res){
			
					$scope.groupsubjects = res.data;
			
			})

		  	// getting sent invitaion list
		  	invitationService.list()
		  		.then(function (res){

		  			$scope.invitations = res.data;

		  	})

		  	// saving invitation
		  	$scope.save = function(formDetails){

		  		invitationService.save(formDetails)
			  		.then(function (res){

			  			if(res.data.success){

			  				toast.show(res.data.message, 'success');
			  				$state.go('invitations.list');

			  			} else {

			  				toast.show(res.data.message, 'danger');
			  			}
			  			

			  	})

		  	}
		  	
		  	

		  	// change Status of the invitation (cancel, resend, delete)
		  	$scope.changeStatus = function(inviteId, event){

		  		invitationService.changeStatus(inviteId, event)
			  		.then(function (res){

			  			console.log(res);

		  		})

		  	}
		  	
	}])