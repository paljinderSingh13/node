app
	.service('adminService', ['$http', function($http){

		// admin login
		this.login = function(formDetails){

			return $http.post('/admin/login', formDetails)
				.then(function successCallback(response){
					return response
				}, function errorCallback(response){
					return response
				})

		}

		// grtting all institutes
		this.getAllInst = function(){

			return $http.get('/admin/getAllInst')
				.then(function successCallback(response){
					return response;
				}, function errorCallback(response){
					return response;
				})

		}

		// getting all groups
		this.getAllGroups = function(){

			return $http.get('/admin/getAllGroups')
				.then(function successCallback(response){
					return response;
				}, function errorCallback(response){
					return response;
				})

		}

		// approve new istitutes
		this.approveInstitute = function(formDetails){

			return $http.put('/admin/approveInstitute', formDetails)
				.then(function successCallback(response){
					return response;
				}, function errorCallback(response){
					return response;
				})

		}

	}])