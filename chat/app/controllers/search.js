var express = require('express');
var app = express();
var server =  require('http').createServer(app);
var io = require('socket.io').listen(server);
var usersModel = require('../../models/users').users;
var interestsCtrl = require('./interests');
var in_array = require('in_array');
var geolib = require('geolib');

var allInterests = [];
// add interests to array

// join room and emit
function joinRoom(userSocket, partnerSocket, allSockets, callback){
  // create room with socket id
  var room = userSocket.id.substring(2);
  userSocket.join(room);
  partnerSocket.join(room);

  // attach room name with sockets

  userSocket.room = room;
  partnerSocket.room = room;

  // remove sockets from array
  var connectedSockets = [];
  connectedSockets.push(userSocket);
  connectedSockets.push(partnerSocket);
  for(var i = 0; i<allSockets.length;i++){
    var j = allSockets.indexOf(userSocket);
    if (i === -1){}
    else{allSockets.splice(i, 1)};
  }
  for(var i = 0; i<allSockets.length;i++){
    var j = allSockets.indexOf(partnerSocket);
    if (i === -1){}
    else{allSockets.splice(i, 1)};
  }
  callback(null,'success');  
};
                
                
                
function joinVideoRoomError(userSocket, partnerSocket, allSockets, callback){
  // create room with socket id
 var room = userSocket.id.substring(2);
  userSocket.join(room);
  partnerSocket.join(room);
  // attach room name with sockets

  userSocket.room = room;
  partnerSocket.room = room;

  // remove sockets from array
  for(var i = 0; i<allSockets.length;i++){
    var j = allSockets.indexOf(userSocket);
    if (i === -1){}
    else{allSockets.splice(i, 1)};
  }
  for(var i = 0; i<allSockets.length;i++){
    var j = allSockets.indexOf(partnerSocket);
    if (i === -1){}
    else{allSockets.splice(i, 1)};
  }

    callback(null,'success');

  
};
function joinVideoRoom(userSocket, partnerSocket, allSockets, callback){
  // create room with socket id
  var room = userSocket.id.substring(2);
  var ps = partnerSocket.id.substring(2); 
  userSocket.emit('peer.connected', { partner: ps, id:room});

  userSocket.join(room);
  partnerSocket.join(room);

  // attach room name with sockets

  userSocket.room = room;
  partnerSocket.room = room;

  // remove sockets from array
  for(var i = 0; i<allSockets.length;i++){
    var j = allSockets.indexOf(userSocket);
    if (i === -1){}
    else{allSockets.splice(i, 1)};
  }
  for(var i = 0; i<allSockets.length;i++){
    var j = allSockets.indexOf(partnerSocket);
    if (i === -1){}
    else{allSockets.splice(i, 1)};
      
    }
    callback(null,'success');
};


// search partner with Interests
function partnerWithInterests(interests, socketId, allSockets, filter, userCountry, callback){
	// search for each socket
  switch (filter){
    case 'nearby':
      nearby(socketId.latitude, socketId.longtitude, socketId.userCountry,function(err, partner){
        callback(null, partner);
      });
      break;
    case 'country':
      country(filter, userCountry, function(err, partner){
        callback(null, partner);
      });
      break;
    case 'world':
      world(filter, function(err, partner){
        callback(null, partner);
      })
      break;
  }
  var arrayInt = [];
  // find nearby partner
  function nearby(userLatitude, userLongtitude, userCountry, callback){
    var matchedNearbySockets = [];
    if(filter === 'nearby'){
      for( var i = 0; i < allSockets.length; i++){
        if(socketId.id === allSockets[i].id){
          // if both same do nothing
        }
        else{
          // make array of interests
          interestsCtrl.makeArray(allSockets[i].interest, function(err, array){
            // search in each socket
            for (var j = 0; j < interests.length; j++){
              // if any filter matches and has same filter -- add socket to array
              if(in_array(interests[j],array) === true && allSockets[i].filter === filter){
                var partnerLatitude = allSockets[i].latitude,
                  partnerLongtitude = allSockets[i].longtitude;
                var distance = geolib.getDistance(
                  {latitude: userLatitude, longitude: userLongtitude }, 
                  {latitude: partnerLatitude, longitude: partnerLongtitude}
                ); 
                if(distance <= 100){
                  matchedNearbySockets.push(allSockets[i]);
                }
              }
            }
          })
        }
      }
      var msg = 'You matched on ';
      if(matchedNearbySockets.length === 0){
          socketId.emit('no nearby','No user found nearby, searching in your country...');
        country('country',userCountry, function(err, partner){
          callback(null, partner);
        });
      }
      
      // if only one user found
      else if(matchedNearbySockets.length === 1){
        // make array of interests
        interestsCtrl.makeArray(matchedNearbySockets[0].interest, function(err, array){
          // search in each socket
          for (var j = 0; j < interests.length; j++){
            // if any filter matches and has same filter -- add socket to array
            if(in_array(interests[j],arrayInt) === true ){
              msg = ' '+msg+'#'+interests[j]+' ';
            }
          }
        });
        socketId.emit('matchedInterests',{msg:msg});
        matchedNearbySockets[0].emit('matchedInterests',{msg:msg});
        var result = {};
        result.partner = matchedNearbySockets[0];
        result.msg = 'You are now connected to a random person nearby. Happy Chatting!';
        callback(null, result);
      }
      // if there are multiple users
      else if(matchedNearbySockets.length >= 2){
        var pIndex = Math.round(Math.random()*matchedNearbySockets.length) - 1;
        if(pIndex == -1){pIndex = 0;}
        // make array of interests
        interestsCtrl.makeArray(matchedNearbySockets[pIndex].interest, function(err, array){
          // search in each socket
          for (var j = 0; j < interests.length; j++){
            // if any filter matches and has same filter -- add socket to array
            if(in_array(interests[j],arrayInt) === true ){
              msg = msg+'#'+interests[j]
            }
          }
        });
        socketId.emit('matchedInterests',{msg:msg});
        matchedNearbySockets[pIndex].emit('matchedInterests',{msg:msg});
        var result = {};
        result.partner = matchedNearbySockets[pIndex];
        result.msg = 'You are now connected to a random person nearby. Happy Chatting!';        
        callback(null,result);
      }

    }
  }

  // find country parnter
  function country(filter,userCountry,callback){
    var matchedCountrySockets = [];
    if(filter === 'country'){
      for( var i = 0; i < allSockets.length; i++){
        if(socketId.id === allSockets[i].id){
          // if both same do nothing
        }
        else{
          // make array of interests
          interestsCtrl.makeArray(allSockets[i].interest, function(err, array){
            // search in each socket
            for (var j = 0; j < interests.length; j++){
              // if any filter matches and has same filter -- add socket to array
              if(in_array(interests[j],array) === true && allSockets[i].filter === filter && userCountry === allSockets[i].country){
                matchedCountrySockets.push(allSockets[i]);
              }
            }
          })
        }
      }
      var msg = 'You matched on ';
      // for loop end
      if(matchedCountrySockets.length === 0){
        socketId.emit('no country','No user found in country, searching in world...');
        world('world',function(err, partner){
          callback(null,partner);
        });
      }
      
      // if only one user found
      else if(matchedCountrySockets.length === 1){
        // make array of interests
        interestsCtrl.makeArray(matchedCountrySockets[0].interest, function(err, array){
          // search in each socket
          for (var j = 0; j < interests.length; j++){
            // if any filter matches and has same filter -- add socket to array
            if(in_array(interests[j],arrayInt) === true ){
              msg = msg+'#'+interests[j]
            }
          }
        });
        socketId.emit('matchedInterests',{msg:msg});
        matchedCountrySockets[0].emit('matchedInterests',{msg:msg});
        var result = {};
        result.partner = matchedCountrySockets[0];
        result.msg = 'You are now connected to a random person from '+userCountry+'. Happy Chatting!';
        callback(null,result);
      }
      // if there are multiple users
      else if(matchedCountrySockets.length >= 2){
        var pIndex = Math.round(Math.random()*matchedCountrySockets.length) - 1;
        if(pIndex == -1){pIndex = 0;}
        // make array of interests
        interestsCtrl.makeArray(matchedCountrySockets[pIndex].interest, function(err, array){
          // search in each socket
          for (var j = 0; j < interests.length; j++){
            // if any filter matches and has same filter -- add socket to array
            if(in_array(interests[j],arrayInt) === true ){
              msg = msg+'#'+interests[j]
            }
          }
        });
        socketId.emit('matchedInterests',{msg:msg});
        matchedCountrySockets[pIndex].emit('matchedInterests',{msg:msg});
        var result = {};
        result.partner = matchedCountrySockets[pIndex];
        result.msg = 'You are now connected to a random person from '+userCountry+'. Happy Chatting!';
        callback(null,matchedCountrySockets[pIndex]);
      }

    }
  }


  // find world partner
  function world(filter, callback){

    var matchedWorldSockets = [];
    if(filter === 'world'){
      for( var i = 0; i < allSockets.length; i++){
        if(socketId.id === allSockets[i].id){
          // if both same do nothing
        }
        else{
          // make array of interests
          interestsCtrl.makeArray(allSockets[i].interest, function(err, array){
            arrayInt = array;
            // search in each socket
            for (var j = 0; j < interests.length; j++){
              // if any filter matches and has same filter -- add socket to array
              if(in_array(interests[j],array) === true && allSockets[i].filter === filter){
                matchedWorldSockets.push(allSockets[i]);
              }
            }
          })
        }
      }
      var msg = 'You matched on ';
      // for loop end
      if(matchedWorldSockets.length === 0){
        callback(null,'no partner found');
      }
      
      // if only one user found
      else if(matchedWorldSockets.length === 1){
        // make array of interests
        interestsCtrl.makeArray(matchedWorldSockets[0].interest, function(err, array){
          // search in each socket
          for (var j = 0; j < interests.length; j++){
            // if any filter matches and has same filter -- add socket to array
            if(in_array(interests[j],arrayInt) === true ){
              msg = msg+'#'+interests[j];
            }
          }
        });
        socketId.emit('matchedInterests',{msg:msg});
        matchedWorldSockets[0].emit('matchedInterests',{msg:msg});
        var result = {};
        result.partner = matchedWorldSockets[0];
        result.msg = 'You are now connected to a random person. Happy Chatting!';
        callback(null,result);
      }
      // if there are multiple users
      else if(matchedWorldSockets.length >= 2){
        var pIndex = Math.round(Math.random()*matchedWorldSockets.length) - 1;
        if(pIndex == -1){pIndex = 0;}
        // make array of interests
        interestsCtrl.makeArray(matchedWorldSockets[pIndex].interest, function(err, array){
          // search in each socket
          for (var j = 0; j < interests.length; j++){
            // if any filter matches and has same filter -- add socket to array
            if(in_array(interests[j],arrayInt) === true ){
              msg = msg+'#'+interests[j]
            }
          }
        });
        socketId.emit('matchedInterests',{msg:msg});
        matchedWorldSockets[pIndex].emit('matchedInterests',{msg:msg});
        var result = {};
        result.partner = matchedWorldSockets[pIndex];
        result.msg = 'You are now connected to a random person. Happy Chatting!';
        callback(null,result);
      }
    }
  } 
  //create results


};

// search partner without Interests
function partnerWithoutInterests(socketId, allSockets, filter, userCountry, int, callback){
  // search each socket
  switch (filter){
    case 'nearby':
      nearby(socketId.latitude, socketId.longtitude, socketId.userCountry,function(err, partner){
        callback(null, partner);
      });
      break;
    case 'country':
      country(filter, userCountry, function(err, partner){
        callback(null, partner);
      });
      break;
    case 'world':
      world(filter, function(err, partner){
        callback(null, partner);
      })
      break;
  }

  // find nearby partner
  function nearby(userLatitude, userLongtitude, userCountry, callback){
    var matchedNearbySockets = [];
    if(filter === 'nearby'){
      for( var i = 0; i < allSockets.length; i++){
        if(socketId.id === allSockets[i].id){
          // if both same do nothing
        }
        else{
          if(filter === allSockets[i].filter){
            var partnerLatitude = allSockets[i].latitude,
              partnerLongtitude = allSockets[i].longtitude;
            var distance = geolib.getDistance(
              {latitude: userLatitude, longitude: userLongtitude }, 
              {latitude: partnerLatitude, longitude: partnerLongtitude}
            ); 
            if(distance <= 100){
              matchedNearbySockets.push(allSockets[i]);
            }
          }
        }
      }
      if(matchedNearbySockets.length === 0){
          setTimeout(function(){
            socketId.emit('no nearby','No user found nearby, searching in your country...');
            country('country',userCountry, function(err, partner){
              callback(null, partner);
            });
          },7000);
      }
      // if only one user found
      else if(matchedNearbySockets.length === 1){
        var result = {};
        result.partner = matchedNearbySockets[0];
        result.msg = 'You are now connected to a random person nearby. Happy Chatting!';
        callback(null, result);
      }
      // if there are multiple users
      else if(matchedNearbySockets.length >= 2){
        var pIndex = Math.round(Math.random()*matchedNearbySockets.length) - 1;
        if(pIndex == -1){pIndex = 0;}
        var result = {};
        result.partner = matchedNearbySockets[pIndex];
        result.msg = 'You are now connected to a random person nearby. Happy Chatting!';
        
        callback(null,result);
      }

    }
  }

  // find country parnter
  function country(filter,userCountry,callback){
    var matchedCountrySockets = [];
    if(filter === 'country'){
      for( var i = 0; i < allSockets.length; i++){
        if(socketId.id === allSockets[i].id){
          // if both same do nothing
        }
        else{
          if(filter === allSockets[i].filter && userCountry === allSockets[i].country){
            matchedCountrySockets.push(allSockets[i]);
          }
        }
      }
      // for loop end
      if(matchedCountrySockets.length === 0){        
          setTimeout(function(){
            socketId.emit('no country','No user found in country, searching in world...');
            world('world',function(err, partner){
              callback(null,partner);
            });
          },7000);
      }
      // if only one user found
      else if(matchedCountrySockets.length === 1){
        var result = {};
        result.partner = matchedCountrySockets[0];
        result.msg = 'You are now connected to a random person from '+userCountry+'. Happy Chatting!';
        callback(null,result);
      }
      // if there are multiple users
      else if(matchedCountrySockets.length >= 2){
        var pIndex = Math.round(Math.random()*matchedCountrySockets.length) - 1;
        if(pIndex == -1){pIndex = 0;}
        var result = {};
        result.partner = matchedCountrySockets[pIndex];
        result.msg = 'You are now connected to a random person from '+userCountry+'. Happy Chatting!';
        callback(null,matchedCountrySockets[pIndex]);
      }

    }
  }


  // find world partner
  function world(filter, callback){
    var matchedWorldSockets = [];
    if(filter === 'world'){
      for( var i = 0; i < allSockets.length; i++){
        if(socketId.id === allSockets[i].id){
          // if both same do nothing
        }
        else{
          if(filter === allSockets[i].filter){
            matchedWorldSockets.push(allSockets[i]);
          }
        }
      }
      // for loop end
      if(matchedWorldSockets.length === 0){
        setTimeout(function(){
          callback(null,'no partner found');
        },7000);
      }
      // if only one user found
      else if(matchedWorldSockets.length === 1){
        var result = {};
        result.partner = matchedWorldSockets[0];
        if(int){
          setTimeout(function(){
            socketId.emit('matchedInterests',{msg:'Sorry, we could not find a match and connected you to a random person. Try adding more interests or change chat filter settings.'});
          },2000);
        }
        result.msg = 'You are now connected to a random person. Happy chatting!';
        callback(null,result);
      }
      // if there are multiple users
      else if(matchedWorldSockets.length >= 2){
        var pIndex = Math.round(Math.random()*matchedWorldSockets.length) - 1;
        if(pIndex == -1){pIndex = 0;}
        var result = {};
        result.partner = matchedWorldSockets[pIndex];
        if(int){
          setTimeout(function(){
            socketId.emit('matchedInterests',{msg:'Sorry, we could not find a match and connected you to a random person. Try adding more interests or change chat filter settings.'});
          },2000);
        }
        result.msg = 'You are now connected to a random person. Happy Chatting!';
        callback(null,result);
      }
    }
  }  
}

module.exports = {
	joinRoom : joinRoom,
	partnerWithInterests : partnerWithInterests,
  partnerWithoutInterests : partnerWithoutInterests,
  joinVideoRoom : joinVideoRoom,
  joinVideoRoomError : joinVideoRoomError
}
