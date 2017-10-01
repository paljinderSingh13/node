app
	.controller('baseCtrl', ['$rootScope','$scope', '$state', '$http', '$window', 'jwtHelper', 'toast', '$timeout', 'dialingCode', '$element', '$interval',
		function ($rootScope ,$scope, $state, $http, $window, jwtHelper, toast, $timeout, dialingCode, $element, $interval) {
		
		$scope.defaultRole 		= 1;

		$scope.isBase 			= true;

		$scope.selectedCountry  = 0;

		$scope.userDetails 		= {}

		$interval(function() {
		    var input = document.querySelector('.am-date-picker__input');

		    $scope.cls = angular.element(input).attr('class');

		    $scope.touched = angular.element(input).hasClass('ng-touched');

		    if(angular.element(input).hasClass('ng-empty') &&  $scope.touched){
		    	angular.element(input).parent('').addClass('md-input-invalid')
		    }
		    else{
		    	angular.element(input).parent('').removeClass('md-input-invalid')
		    }

		}, 100);

		// function for registraion
		$scope.register = function(userDetails){

			if(userDetails){

				if(userDetails.role == 1 || userDetails.role == 2){
				
					userDetails.groupType = 'Institute';
				
				} else {

					userDetails.groupType = 'Group';

				}

				$http.post('/api/register', userDetails)
					.then(function successCallback(response){

						if(response.data.success){

							$window.localStorage.ud_classrooms = response.data.details;

							$state.go('otp');

						} else {
							
							toast.show(response.data.message, 'danger');

						}
						
					}, function errorCallback(response){
						
						toast.show('Something went wrong. Please refresh and try again.', 'danger');
			
					})

			} else {

				toast.show('Something went wrong. Please refresh and try again.', 'danger');

			}

		}


		// function to check OTP
		$scope.checkOTP = function (otpDetails) {
			
			var userDetails = jwtHelper.decodeToken($window.localStorage.ud_classrooms);
			
			if(otpDetails){

				if(otpDetails.otp === userDetails.otp){

					$http.post('/api/verifyotp', otpDetails,
						{headers: {
							'Authorization' : $window.localStorage.ud_classrooms
						}})
						.then( function successCallback(response){

							//console.log(response);
							if(response.data.success){

								$window.localStorage.ud_classrooms = response.data.details;

								toast.show(response.data.message, 'success');

								$timeout(function (){

									$state.go('password');

								}, 500)

							}

						}, function errorCallback(response){

							toast.show('Something went wrong. Please refresh the page and try again', 'danger');

						})


				} else {

					toast.show('Incorrect OTP. Please enter correct OTP', 'danger');

				}

			}
			
		}
		
		// function to set password
		$scope.setPassword =  function (formDetails){

			if(formDetails.password == formDetails.confirmPassword){

				$http.post('/api/savepassword', {'password' : formDetails.password},
					{headers: {
							'Authorization' : $window.localStorage.ud_classrooms
					}})
					.then( function successCallback(response){

						if(response.data.success){

							$window.localStorage.removeItem('ud_classrooms');

							toast.show(response.data.message, 'success');

							$timeout(function (){

								//alert('i can now redirect');
								$state.go('/');

							}, 500);

						}

					}, function errorCallback(response){

						toast.show('Something went wrong. Please refresh the page and try again', 'danger');
					})

			} else {

				toast.show("Password dosen't match. Please try again", 'danger');
			}

		}

		// function to do login
		$scope.doLogin = function (formDetails){

			$http.post('/api/login', formDetails)
				.then( function successCallback(response){

					if(response.data.success){


						toast.show(response.data.message, 'success');
						
						$rootScope.user = jwtHelper.decodeToken(response.data.details);

						$window.localStorage.ud_classrooms = response.data.details;
						
						// setting up http headers to send authorization header with every call
						$http.defaults.headers.common.Authorization = response.data.details;

						$timeout(function (){

							$state.go('dashboard.home');

						}, 1000);

					} else {

						toast.show(response.data.message, 'danger');
					}

				}, function errorCallback(response){

					toast.show('Something went wrong. Please refresh the page and try again', 'danger');
				})

		}

		//  to get user country and show relevant dialing code
		$http.get('http://ipinfo.io/').success(function(data){
			
			$scope.country = dialingCode.getCode(data.country);
			
			$scope.countries = dialingCode.allCodes();

			$scope.selectedCountry = $scope.countries.indexOf($scope.country);


		})

		$element.find('input').on('keydown', function(ev) {
      		ev.stopPropagation();
      	});

	}])