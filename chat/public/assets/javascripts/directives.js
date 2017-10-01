
'use strict';

angular.module('kosmochat')
//factory
.factory('filter',['saveInterests',function(saveInterests){
  var type = {};
  var add = {};
  var intDisable;
  var allInterest = [];
  function set(filterType,interestsDisable,secondParam){
    type = filterType;
    add = secondParam;
    intDisable = interestsDisable;
  }
  function setInt(interests){
    saveInterests.setMyData(interests);
  }
  function removeInt(interests){
    saveInterests.removeMyData(interests);
  }
  function gettype(){
    return type;
  }
  function getadd(){
    return add;
  }
  function getinterests(){
    var interests = saveInterests.getMyData();
    return interests;
  }
  function setintDisable(value){
    intDisable = value;
  }
  function getintDisable(){
    return intDisable;
  }

  return {set:set,getT: gettype,getA:getadd,getI:getinterests,GetD:getintDisable,setD:setintDisable,setInt:setInt,removeInt:removeInt};
}])
.service('saveInterests', function() {
    this.allInterest = [];

    this.setMyData = function(int) {
      if(this.allInterest.indexOf(int) == -1){
        this.allInterest.push(int);
      }
      else{
        alert('already added');
      }
    };

    this.removeMyData = function(int) {
      var i = this.allInterest.indexOf(int);
      this.allInterest.splice(i,1);
    };

    this.getMyData = function() {
        return this.allInterest;
    };
})

.directive('scrollBottom', function () {
  return {
    scope: {
      scrollBottom: "=" 
    },
    link: function (scope, element) {
      scope.$watchCollection('scrollBottom', function (newValue) {
        if (newValue)
        {
          $(".scroll-body").slimScroll({scrollTo: $('#chat-messages').height() + 150});
          $(element).parents('.scroll-body').scrollTop($('#chat-messages').height() + 150);
        }
      });
    }
  }
})
//socket factory that provides the socket service
.factory('Socket',function(socketFactory) {
  //var socket = io.connect('http://localhost:3000');
  return socketFactory();
})
.factory('AuthService',['$http','$q','$window',function($http,$q,$window){
  return{
    sessId : function(user){
      var socketid = user.socketId.substring(2);
      return $http.get('/api/session?userId='+user._id+'&socketId='+socketid+'&filter='+user.filter+'&country='+user.country+'&ip='+user.ip+'&type='+user.type+'&interest='+user.interest)
      // handle success
      .then(function(response){
          $window.sessionStorage.setItem('user',response.data.userId);
          return response.data;
      },
      function(response){
        return $q.reject(response.data);
      })
    }
  }
}])
.factory('videoChat',['$http','$q','$window',function($http,$q,$window){
  return{
    find : function(user){
      var socketid = user.socketId.substring(2);
      return $http.get('/api/videoChat?userId='+user._id+'&socketId='+socketid+'&filter='+user.filter+'&country='+user.country+'&ip='+user.ip+'&type='+user.type+'&interest='+user.interest)
      // handle success
      .then(function(response){
          $window.sessionStorage.setItem('user',response.data.userId);
          return response.data;
      },
      function(response){
        return $q.reject(response.data);
      })
    }
  }
}])
.directive('matchHeight',function () { //declaration; identifier master
    function link(scope, element, attrs) { //scope we are in, element we are bound to, attrs of that element
      scope.$watch(function(){ //watch any changes to our element
        var height = element[0].offsetHeight - 4;
        scope.style = { //scope variable style, shared with our controller
          
            height:height+'px', //set the height in style to our elements height
            'margin-top':'-'+height+'px'
          };
      });
    }
    return {
      restrict: 'AE', //describes how we can assign an element to our directive in this case like <div master></div
      link: link // the function to link to our element
    };
})
/*.directive('chatHeight',function () { //declaration; identifier master
  //window.onresize = function(){}
    function link(scope, element, attrs) { //scope we are in, element we are bound to, attrs of that element
      scope.$watch(function(){ //watch any changes to our element
        var height = window.innerHeight - 65;
        
        scope.style = { //scope variable style, shared with our controller
          
            height:height+'px'
          };
      });
    }
      return {
        restrict: 'AE', //describes how we can assign an element to our directive in this case like <div master></div
        link: link // the function to link to our element
      };
})*/
.directive('chatHeight',function ($window) { //declaration; identifier master

    return function (scope, element, attr) {

        var w = angular.element($window);
        scope.$watch(function () {
            return {
                'h': w.height(), 
                'w': w.width()
            };
        }, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.resizeWithOffset = function (offsetH) {
                scope.$eval(attr.notifier);
                return { 
                    'height': (newValue.h - offsetH) + 'px'                    
                };
            };
            scope.videoBoxesOffset = function (offsetH) {
                scope.$eval(attr.notifier);
                return { 
                    'height': (newValue.h / 2 - offsetH) + 'px'                    
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
})
.directive('filtersHeight',function () { //declaration; identifier master
  //window.onresize = function(){}
    function link(scope, element, attrs) { //scope we are in, element we are bound to, attrs of that element
      scope.$watch(function(){ //watch any changes to our element
        var height = window.innerHeight - 110;
        
        scope.style = { //scope variable style, shared with our controller
          
            'min-height':height+'px'
          };
      });
    }
      return {
        restrict: 'AE', //describes how we can assign an element to our directive in this case like <div master></div
        link: link // the function to link to our element
      };
})
.factory('authAdmin',
  ['$q', '$timeout', '$http','$window',
  function ($q, $timeout, $http,$window) {

    // create user variable
    var user , admin;

    // return available functions for use in the controllers
    return ({
      isLoggedIn: isLoggedIn,
      login: login,
      logout: logout,
      isAdmin :isAdmin
    });

    function isAdmin(){
      admin = $window.sessionStorage.getItem('admin');
      return admin;
    }
    function isLoggedIn() {
      if(user) {
        return true;
      } else {
        return false;
      }
    }
    function login(username, password) {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a post request to the server
      $http.post('/api/login',
        {username: username, password: password})
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            user = true;
            $window.sessionStorage.setItem('admin',true)
            admin = $window.sessionStorage.getItem('admin');
            deferred.resolve();
          } else {
            user = false;
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }
    function logout() {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a get request to the server
      $http.get('/api/logout')
        // handle success
        .success(function (data) {
          user = false;
          $window.sessionStorage.setItem('admin',false)
          deferred.resolve();
        })
        // handle error
        .error(function (data) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

}])
.factory('userip',function() {
  var userip;
  var partnerip;
  var userroom;
  function verifyip(ip){
    console.log(ip);
  }
  function setip(ip){
    userip = ip;
  }
  function setpartnerip(ip,room){
    partnerip = ip;
    userroom = room;
  }
  function getip(){
    return userip;
  }
  function getpartnerip(){
    return userip;
  }
  function getroom(){
    return userroom;
  }
  return {
    verify : verifyip,set:setip,get:getip,setPartner:setpartnerip, getPartner:getpartnerip, getroom:getroom
  }
})
.factory('getActiveVideoRooms',
  ['$q', '$timeout', '$http','$window',
  function ($q, $timeout, $http,$window) {

    // create user variable
    // return available functions for use in the controllers

    var getRooms = function(){
      var allRooms = [];
      // send a post request to the server
      return $http.get('/api/rooms')
        // handle success
        .success(function (data, status) {
          //findSockets(data, function(rooms){
            return data;
          //});      
        })
        // handle error
        .error(function (data) {
          //users = null;
        });   
          
            
        /*for( var i = 0; i < users[0].length; i++){
          if(users[0][i].length === 2){
            allRooms.push(users[0][i]);
          }
        }*/

      // return object
      
    };
    return ({
      getRooms: getRooms,
      getSocket: getSocketDetails
    });
    function getSocketDetails(socketId){
      var socket ;
      $http.get('/api/socket')
      .success(function(data,status){
        socket = data;
      })
      .error(function(data){
        socket = null;
      })
      return socket;
    }

}])


