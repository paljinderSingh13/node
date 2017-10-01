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
			        .title('Would you like to delete this record ?')
			        .textContent('All data associated with this record will be erased and cannot be recover.')
			        .ariaLabel('Delete')
			        .targetEvent(ev)
			        .ok('Yes Delete It')
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