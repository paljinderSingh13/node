
//"use strict";
angular.module('kosmochat')
//factory

.filter('reverse',[function(){
    return function(string){
        return string.split('').reverse().join('');
    }
}])
.factory("userBan", function($q,$http){
    return {
      getstatus: function(){
        var ip = 'https://api.ipify.org/?format=json';
          $http.get(ip).then(function(ipL){
          //$scope.userIP = ipL.data.ip;
          //userip.set($scope.userIP);
          // verify ip from the backend
          var ban;
          return $http.post('/api/verifyIp',{ip:ipL.data.ip})
          .success(function(data){
            if(data == 'banned'){
              ban = true;
              console.log(ban);
              return ban;
            }
            else{  
              ban = false;
              console.log(ban);
              return ban;
            }
          });
        });
      }
    };
});


