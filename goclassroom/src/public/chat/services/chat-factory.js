angular.module('chat')
.factory('lsdajgfads',['$scope','$http',function($scope,$http){

	return {
		getUsers : getUsers,
		getMessages : getMessages
	}

	function getUsers(){
		$http.get('/users').success(function(users){
			return users;
		})
	}
	function getMessages(user1 , user2){
		console.log('user1 '+user1 + 'user2 '+user2)
		$http.get('/users').success(function(user1 , user2){
			return users;
		})
	}
}])
//socket factory that provides the socket service
.factory('Socket',function(socketFactory) {
  var socket = io.connect('http://localhost:3000');
  return socketFactory();
})
