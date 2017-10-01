app
	// toast notification service
	.factory('toast', ['$mdToast', 
		function ($mdToast) {
		
			function show(message, type, delay=1500) {
				
				$mdToast.show(
			      $mdToast.simple()
			        .textContent(message)
			        .toastClass(type)
			        .position('bottom right' )
			        .hideDelay(delay)
			    );
			    
			}

			return {

				show : show

			};

	}])

	// alertBox service
	.factory('alertBox', ['$mdDialog', '$q', 
		function ($mdDialog, $q) {
		
			function confirmAlert(ev) {
			     var deferred = $q.defer();

			    var confirm = $mdDialog.confirm()
			        .title('Approve this Insitute')
			        .textContent('Registered user will be able to manage this institute by himself. Are you sure you want to approve this institute')
			        .ariaLabel('Approve')
			        .targetEvent(ev)
			        .ok('Yes Approve It')
			        .cancel('Cancel');

			    $mdDialog.show(confirm).then(function() {
			      	deferred.resolve();
			    }, function() {
			      	deferred.reject();
			    });

			    return deferred.promise;
			  };

			return {

				confirmAlert : confirmAlert

			};

	}])