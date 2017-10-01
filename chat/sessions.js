module.exports = function(app) {

app.get('/api/session',function(req,res){
  var userid = req.query.userId,
  socketId = '/#'+req.query.socketId,
  filter = req.query.filter,
  userCountry = req.query.country,
  userIP = req.query.ip,
  userLatitude = req.query.latitude,
  userLongtitude = req.query.longtitude,
  type = req.query.type;
  interest = req.query.interest;
  interestArray = interest.split(",");
  //for(i = 0; i <= interest; i++){}
  // socket Instance
  console.log(type);
  var io = req.app.get('socketio');
  
  if(type == 'video'){
    var usersCount = videoChatSockets.length;
    if(usersCount >= 2){
      console.log('2 users detected');
      findPartnerVideo();
      function findPartnerVideo(){
        var pIndex = Math.round(Math.random()*videoChatSockets.length) - 1;
        if(pIndex == -1){pIndex = 0;}
        var partnerSocket = videoChatSockets[pIndex];
        if(partnerSocket == 'undefined'){
          //setTimeout(function(){
            console.log('partner socket undefined');
            res.send('no partner found'); 
            return;
          //},10000);
        }
        else if(!partnerSocket){
          //setTimeout(function(){
            console.log('partner socket null');
            res.send('no partner found'); 
            return;
          //},10000);
        }
        else if(partnerSocket.id == socketId){
          console.log('partner socket similar to user');
          return;
        }
        else{
          console.log('partner found');
          if(partnerSocket.filter == filter){
            // if user choose country filter
            if(filter == 'country'){
              // find a partner from same country
              if(partnerSocket.country == userCountry){
                var room = userid;
                io.sockets.connected[socketId].join(room);
                console.log(partnerSocket.id);
                var ps = partnerSocket.id.substring(2);                
                io.sockets.connected[partnerSocket.id].join(room);
                var clients = io.sockets.adapter.rooms[room];
                console.log(clients);
                io.sockets.connected[socketId].emit('peer.connected', { partner: ps, id:req.query.socketId});
                for(var i = 0; i<videoChatSockets.length;i++){
                  if(videoChatSockets[i].id == socketId){
                    videoChatSockets.splice(i,1);
                  }
                }
                for(var i = 0; i<videoChatSockets.length;i++){
                  if(videoChatSockets[i].id == partnerSocket.id){
                    videoChatSockets.splice(i,1);
                  }
                }
                usersModel.findOne({socketId:partnerSocket.id},function(err, partnerUser){
                  usersModel.update({_id:userid},{$set:{"connected":true,}},function(err){});
                  // change the status of partner to connected
                  usersModel.update({_id:partnerUser._id},{$set:{"connected":true}},function(err){});
                    // send ids
                    console.log('partner sent back');
                  res.json({userId:userid,partnerId:partnerUser._id,room:room,msg:'You are now connected to a random person from '+userCountry+'. Happy Chatting!'});
                  //io.sockets.in(room).emit('partnersConnected',{connection:'connected',msg:'You are now connected to a random person from '+userCountry+'. Happy Chatting!',room:room});
                  return;
                })
              }
              else{
                findPartnerVideo();
              }
            }
            else if(filter == 'nearby'){
              // |||| match distance with geolib ||||
              var distance = geolib.getDistance(
                {latitude: userLatitude, longitude: userLongtitude }, 
                {latitude: partnerSocket.latitude, longitude: partnerSocket.longtitude}
              );
              console.log('distance of users are '+distance + ' meters');
              if(distance <= 100){
                // |||| match distance with geolib ||||
                var room = userid;
                io.sockets.connected[socketId].join(room);
                console.log(partnerSocket.id);
                var ps = partnerSocket.id.substring(2);                
                io.sockets.connected[partnerSocket.id].join(room);
                var clients = io.sockets.adapter.rooms[room];
                console.log(clients);
                io.sockets.connected[socketId].emit('peer.connected', { partner: ps, id:req.query.socketId});
                for(var i = 0; i<videoChatSockets.length;i++){
                  if(videoChatSockets[i].id == socketId){
                    videoChatSockets.splice(i,1);
                  }
                }
                for(var i = 0; i<videoChatSockets.length;i++){
                  if(videoChatSockets[i].id == partnerSocket.id){
                    videoChatSockets.splice(i,1);
                  }
                }
                usersModel.findOne({socketId:partnerSocket.id},function(err, partnerUser){
                  usersModel.update({_id:userid},{$set:{"connected":true,}},function(err){});
                  // change the status of partner to connected
                  usersModel.update({_id:partnerUser._id},{$set:{"connected":true}},function(err){});
                    // send ids
                    console.log('partner sent back');
                  res.json({userId:userid,partnerId:partnerUser._id,room:room,msg:'You are now connected to a random person from '+userCountry+'. Happy Chatting!'});
                  //io.sockets.in(room).emit('partnersConnected',{connection:'connected',msg:'You are now connected to a random person from '+userCountry+'. Happy Chatting!',room:room});
                  return;
                })
              }
              else{
                findPartnerVideo(); 
              }
            }
            else if(filter == 'world'){
              // |||| Looking for interests ||||
              usersModel.findOne({socketId:partnerSocket.id},function(err,partnerUser){
                interestsModel.find({user:partnerUser._id},function(err,int){
                  //console.log(int.interest);
                })
              })
              var room = userid;
              io.sockets.connected[socketId].join(room);
              console.log(partnerSocket.id);
              var ps = partnerSocket.id.substring(2);                
              io.sockets.connected[partnerSocket.id].join(room);
              var clients = io.sockets.adapter.rooms[room];
              console.log(clients);
              io.sockets.connected[socketId].emit('peer.connected', { partner: ps, id:req.query.socketId});
              for(var i = 0; i<videoChatSockets.length;i++){
                if(videoChatSockets[i].id == socketId){
                  videoChatSockets.splice(i,1);
                }
              }
              for(var i = 0; i<videoChatSockets.length;i++){
                if(videoChatSockets[i].id == partnerSocket.id){
                  videoChatSockets.splice(i,1);
                }
              }
              usersModel.findOne({socketId:partnerSocket.id},function(err, partnerUser){
                usersModel.update({_id:userid},{$set:{"connected":true,}},function(err){});
                // change the status of partner to connected
                usersModel.update({_id:partnerUser._id},{$set:{"connected":true}},function(err){});
                  // send ids
                  console.log('partner sent back');
                res.json({userId:userid,partnerId:partnerUser._id,room:room,msg:'You are now connected to a random person. Happy Chatting!'});
                io.sockets.in(room).emit('partnersConnected',{connection:'connected',msg:'You are now connected to a random person. Happy Chatting!',room:room});
                return;
              })
            }
          }
          else{
            findPartnerVideo();
          }
        }
      }
    }
    else{
      console.log('only one user');
      res.send('no partner found'); 
    }
  }
  else if(type == 'videoError'){
    var vusersCount = videoChatSockets.length;
    console.log(vusersCount);
    if(vusersCount >= 2){
      findPartnerError();
      function findPartnerError(){
        var pIndex = Math.round(Math.random()*videoChatSockets.length) - 1;
        if(pIndex == -1){pIndex = 0;}
        var partnerSocket = videoChatSockets[pIndex];
        if(partnerSocket == 'undefined'){
          //setTimeout(function(){
            res.send('no partner found'); 
          //},10000);
        }
        else if(!partnerSocket){
          //setTimeout(function(){
            res.send('no partner found'); 
          //},10000);
        }
        else if(partnerSocket.id == socketId){
          console.log('partner socket similar to user');
          findPartnerError();
        }
        else{
          console.log('working');
          if(partnerSocket.filter == filter){
            // if user choose country filter
            if(filter == 'country'){
              // find a partner from same country
              if(partnerSocket.country == userCountry){
                var room = userid;
                io.sockets.connected[socketId].join(room);
                io.sockets.connected[partnerSocket.id].join(room);
                for(var i = 0; i<videoChatSockets.length;i++){
                  if(videoChatSockets[i].id == socketId){
                    videoChatSockets.splice(i,1);
                  }
                }
                for(var i = 0; i<videoChatSockets.length;i++){
                  if(videoChatSockets[i].id == partnerSocket.id){
                    videoChatSockets.splice(i,1);
                  }
                }
                usersModel.findOne({socketId:partnerSocket.id},function(err, partnerUser){
                usersModel.update({_id:userid},{$set:{"connected":true,}},function(err){});
                // change the status of partner to connected
                usersModel.update({_id:partnerUser._id},{$set:{"connected":true}},function(err){});
                  // send ids
                res.json({userId:userid,partnerId:partnerUser._id,room:room,msg:'You are now connected to a random person from '+userCountry+'. Happy Chatting!'});
                io.sockets.in(room).emit('partnersConnected',{connection:'connected',msg:'You are now connected to a random person from '+userCountry+'. Happy Chatting!',room:room});
                })
              }
              else{
                findPartnerError();
              }
            }
            else if(filter == 'nearby'){
              // |||| match distance with geolib ||||
              var distance = geolib.getDistance(
                {latitude: userLatitude, longitude: userLongtitude }, 
                {latitude: partnerSocket.latitude, longitude: partnerSocket.longtitude}
              );
              console.log('distance of users are '+distance + ' meters');
              if(distance <= 100){
                // |||| match distance with geolib ||||
                var room = userid;
                io.sockets.connected[socketId].join(room);
                io.sockets.connected[partnerSocket.id].join(room);
                for(var i = 0; i<videoChatSockets.length;i++){
                  if(videoChatSockets[i].id == socketId){
                    videoChatSockets.splice(i,1);
                  }
                }
                for(var i = 0; i<videoChatSockets.length;i++){
                  if(videoChatSockets[i].id == partnerSocket.id){
                    videoChatSockets.splice(i,1);
                  }
                }
                usersModel.findOne({socketId:partnerSocket.id},function(err, partnerUser){
                usersModel.update({_id:userid},{$set:{"connected":true,}},function(err){});
                // change the status of partner to connected
                usersModel.update({_id:partnerUser._id},{$set:{"connected":true}},function(err){});
                  // send ids
                res.json({userId:userid,partnerId:partnerUser._id,room:room,msg:'You are now connected to a random person nearby. Happy Chatting!'});
                io.sockets.in(room).emit('partnersConnected',{connection:'connected',msg:'You are now connected to a random person nearby. Happy Chatting!',room:room});
                })
              }
              else{
                findPartnerError(); 
              }
            }
            else if(filter == 'world'){
              for(ia = 0;ia < interestArray.length; ia++){
                console.log('interest #'+interestArray[ia]);
              }
              // |||| Looking for interests ||||

              var room = userid;
              io.sockets.connected[socketId].join(room);
              console.log(partnerSocket.id);
              var ps = partnerSocket.id.substring(2);                
              io.sockets.connected[partnerSocket.id].join(room);
              var clients = io.sockets.adapter.rooms[room];
              console.log(clients);
              for(var i = 0; i<videoChatSockets.length;i++){
                if(videoChatSockets[i].id == socketId){
                  videoChatSockets.splice(i,1);
                }
              }
              for(var i = 0; i<videoChatSockets.length;i++){
                if(videoChatSockets[i].id == partnerSocket.id){
                  videoChatSockets.splice(i,1);
                }
              }
              usersModel.findOne({socketId:partnerSocket.id},function(err, partnerUser){
                usersModel.update({_id:userid},{$set:{"connected":true,}},function(err){});
                // change the status of partner to connected
                usersModel.update({_id:partnerUser._id},{$set:{"connected":true}},function(err){});
                  // send ids
                  console.log('partner sent back');
                res.json({userId:userid,partnerId:partnerUser._id,room:room,msg:'You are now connected to a random person. Happy Chatting!'});
                io.sockets.in(room).emit('partnersConnected',{connection:'connected',msg:'You are now connected to a random person. Happy Chatting!',room:room});
                return;
              })
            }
          }
          else{
            findPartnerError();
          }
        } 
      }
    }
    else{
      //setTimeout(function(){
        console.log('returning from here');
        res.send('no partner found'); 
      //},10000);
    }
    // function for search a partner
  }
  else{
    var usersCount = allSockets.length;
    if(usersCount >= 2){
      findPartner();
      function findPartner(){
        var pIndex = Math.round(Math.random()*allSockets.length) - 1;
        if(pIndex == -1){pIndex = 0;}
        var partnerSocket = allSockets[pIndex];
        if(partnerSocket == 'undefined'){
          //setTimeout(function(){
            res.send('no partner found'); 
          //},10000);
        }
        else if(!partnerSocket){
          //setTimeout(function(){
            res.send('no partner found'); 
          //},10000);
        }
        else if(partnerSocket.id == socketId){
          console.log('partner socket similar to user');
          findPartner();
        }
        else{
          if(partnerSocket.filter == filter){
            searchByFilter(filter,partnerSocket, userCountry, userLatitude, userLongtitude, partnerSocket.latitude, partnerSocket.longtitude, userid, socketId,partnerSocket.id,res);
          }
        } 
      }
    }
    else{
      //setTimeout(function(){
        res.send('no partner found'); 
      //},10000);
    }
    // function for search a partner
  }
});
// search partner based on filter

function searchByFilter(filter, partnerSocket, userCountry, userLatitude, userLongtitude, partnerSocketLatitude, partnerSocketLongtitude, userid, socketId,partnerSocketId,res){
  // function
  switch (filter){
    case 'world':
      for(ia = 0;ia < interestArray.length; ia++){
        console.log('interest #'+interestArray[ia]);
      }
      // |||| Looking for interests ||||
      var msg = 'You are now connected to a random person. Happy Chatting!';
      joinRoom(userid,socketId, partnerSocketId,msg,res);
      break;
    // if user choose country filter
    case 'country':
      // find a partner from same country
      if(partnerSocket.country == userCountry){
        var msg = 'You are now connected to a random person from '+userCountry+'. Happy Chatting!';
        joinRoom(userid,socketId, partnerSocketId,msg,res);
      }
      else{
        searchByFilter('world',partnerSocket, userCountry, userLatitude, userLongtitude, partnerSocketLatitude, partnerSocketLongtitude, userid, socketId,partnerSocketId);
      }
      break;
    case 'nearby' :
      // |||| match distance with geolib ||||
      console.log( 'user latitude: '+userLatitude+ ' user longtitude: '+userLongtitude+' partner socket latitude: '+partnerSocketLatitude+' partner longtitude: '+partnerSocketLongtitude );
      var distance = geolib.getDistance(
        {latitude: userLatitude, longitude: userLongtitude }, 
        {latitude: partnerSocketLatitude, longitude: partnerSocketLongtitude}
      );
      console.log('distance of users are '+distance + ' meters');
      var msg = 'You are now connected to a random person nearby. Happy Chatting!';
      // #1 userid
      // #2 partnerSocket.id
      if(distance <= 100){
        // |||| match distance with geolib ||||
        joinRoom(userid,socketId, partnerSocketId, msg,res);
      }
      else{
        searchByFilter(partnerSocket.userCountry,partnerSocket, userCountry, userLatitude, userLongtitude, partnerSocketLatitude, partnerSocketLongtitude, userid, socketId,partnerSocketId);
      }
      break;
  }
  // function
}

// join room and emit
function joinRoom(userid,socketId, partnerSocketId,msg,res){
  var room = userid;
  io.sockets.connected[socketId].join(room);
  io.sockets.connected[partnerSocketId].join(room);
  for(var i = 0; i<allSockets.length;i++){
    if(allSockets[i].id == socketId){
      allSockets.splice(i,1);
    }
  }
  for(var i = 0; i<allSockets.length;i++){
    if(allSockets[i].id == partnerSocketId){
      allSockets.splice(i,1);
    }
  }
  usersModel.findOne({socketId:partnerSocketId},function(err, partnerUser){
  usersModel.update({_id:userid},{$set:{"connected":true,}},function(err){});
  // change the status of partner to connected
  usersModel.update({_id:partnerUser._id},{$set:{"connected":true}},function(err){});
    // send ids
  res.json({userId:userid,partnerId:partnerUser._id,room:room,msg:msg});
  io.sockets.in(room).emit('partnersConnected',{connection:'connected',msg:msg,room:room});
  })
};
}