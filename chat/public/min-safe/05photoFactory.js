angular.module('chatModule')

  // photo sharing factory
  .factory('sharePhoto',['Socket', function(Socket){
    // handle photo sharing request
    function photoShareRequest(userId,room){
      var photoRequested ={};
      photoRequested.request="sent";
      photoRequested.status=true;
      photoRequested.questionAsked=true;
      photoRequested.user=userId;
      photoRequested.room=room;
      Socket.emit("photoRequest",photoRequested);
    }

    // approve and reject notification

    return {
      request : photoShareRequest
    };
  }]);
