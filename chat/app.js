var express = require('express'),
  app = express(),
  server =  require('http').createServer(app),
  io = require('socket.io').listen(server),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  passport = require('passport'), 
  LocalStrategy = require('passport-local').Strategy,
  fs = require('fs'),
  multer = require('multer'),
  multiparty = require('multiparty'),
  nodemailer = require('nodemailer'),
  uuid = require('node-uuid'),
  smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: '', // please provide your gmail email
        pass: '' // please provide password
    }
  };
var interestsCtrl = require('./app/controllers/interests');
var search = require('./app/controllers/search');
var path = require('path');
var transporter = nodemailer.createTransport(smtpConfig);

var routes = require('./routes')(app);

var usersModel = require('./models/users').users;
var adminModel = require('./models/users').admin;
var interestsModel = require('./models/interests').interests;
var filesModel = require('./models/files');
var blockUsers = require('./models/blocked').blockUsers;
var moduleM = require('./module');
var form = new multiparty.Form();

var storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
      cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, datetimestamp+'-' +file.originalname)
  }
});
var upload = multer({
  storage:storage
})

server.listen(process.env.PORT || 3000, '0.0.0.0', function() {
    console.log('Listening to port:  ' + 3000);

});
app.use(express.static(__dirname + '/public'));
app.use(session({resave:true, saveUninitialized:true, secret:"kosmochat"}));
// app middleware
app.use(function(req, res, next){
	//req.session.name = req.sessionID;
	next();
})      
//required for passport
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(adminModel.authenticate()));


// db connection            
//mongoose.connect('mongodb://heroku_7x5gw8bb:m8n8ih9cki12sjjopjaprj4amu@ds145325.mlab.com:45325/heroku_7x5gw8bb');
mongoose.connect('mongodb://localhost/kosmochat1');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

app.set('socketio', io);
// db connection end
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));


app.get('/api/rooms',function(req,res){
  res.json(io.sockets.adapter.rooms);
})

//register a user with passport
app.post('/api/register', function(req, res) {

    adminModel.register(new adminModel({ username : req.body.user.username }), req.body.user.pass, function(err, account) {
        if (err) {
            res.json(	{info: "Sorry. That username already exists. Try again."})
        }
        console.log("user created")
        res.json(account)
    });
});
//login with passport
app.post('/api/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      res.status(200).json({
        status: 'Login successful!'
      });
    });
  })(req, res, next);
});


app.get('/api/users',function(req,res){
  mongoose.model('users').find(function(err,users){
    res.send(users);
  })
})

app.get('/api/interests',function(req,res){
  interestsModel.find(function(err,interests){
    res.send(interests);
  })
})


app.get('/api/module',function(req,res){ 

  res.send(moduleM.get());
})

//require('./app/session.js')(app);
// video chat
app.get('/api/videoChat',function(req,res){
  var userid = req.query.userId,
  socketId = '/#'+req.query.socketId,
  filter = req.query.filter,
  userCountry = req.query.country,
  userIP = req.query.ip,
  type = req.query.type,
  interest = req.query.interest;
  var io = req.app.get('socketio');
  socketId = io.sockets.connected[socketId];
  //for(i = 0; i <= interest; i++){}
  // socket Instance
  console.log(userid);
  
  if(type == 'video'){
    var usersCount = videoChatSockets.length;
    if(usersCount >= 2){
      // if user fill any interest

      if(socketId.interest){
        var int_usersInterest = socketId.interest;
        // search a partner based on interest
        interestsCtrl.searchInterest(int_usersInterest,function(err,result){ 
          //console.log(result);
          // if there is no match then search partner without interests
          if(result.length === 0){
            setTimeout(function(){
              search.partnerWithoutInterests(socketId, videoChatSockets, filter, userCountry, true, function(err,partners){
                  // if there is no result
                  if(partners === 'no partner found'){ res.send('no partner found'); return;}
                  findVideoPartner(partners); 
              });         
            },8000); 
          }
          else{            
            search.partnerWithInterests(result, socketId, videoChatSockets, filter, userCountry, function(err,partners){
              console.log('partners length with interest is '+partners.length);
              // if there is no result
              if(partners === 'no partner found'){
                // search without interest
                setTimeout(function(){
                  search.partnerWithoutInterests(socketId, videoChatSockets, filter, userCountry, false, function(err,partners){
                    // if there is no result
                    if(partners === 'no partner found'){ res.send('no partner found'); return;}
                    findVideoPartner(partners); 
                  });
                },8000)
                return;
              }
              findVideoPartner(partners); 
            });
          }
        });
      }
      // if no interest fill
      else{
        search.partnerWithoutInterests(socketId, videoChatSockets, filter, userCountry, false, function(err,partners){
          // if there is no result
          if(partners === 'no partner found'){ res.send('no partner found'); return;}
          findVideoPartner(partners); 
        });
      }
      // find partner function
      function findVideoPartner(partner){
        var userid = userid;
        var userSocket = socketId;
        var partnerSocket = partner.partner;
        var msg = partner.msg;
        // function
        search.joinVideoRoom(userSocket, partnerSocket, videoChatSockets, function(err, result){
          if(result){
            var room = userSocket.id.substring(2);            
            usersModel.findOne({socketId:partnerSocket.id},function(err, partnerUser){
            res.json({userId:userid,partnerId:partnerUser._id,room:room,msg:msg});
            io.sockets.in(room).emit('partnersConnected',{connection:'connected',msg:msg,room:room,ip:partnerSocket.ip});
            });
          }
          else{
            res.send('no partner found');
          }
        });
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
      console.log(' video error partner ');
      // if user fill any interest
      if(socketId.interest){
        var int_usersInterest = socketId.interest;
        // search a partner based on interest
        interestsCtrl.searchInterest(int_usersInterest,function(err,result){ 
          //console.log(result);
          // if there is no match then search partner without interests
          if(result.length === 0){
            setTimeout(function(){
              search.partnerWithoutInterests(socketId, videoChatSockets, filter, userCountry, true, function(err,partners){
                // if there is no result
                if(partners === 'no partner found'){ res.send('no partner found'); return;}
                findVideoPartnerError(partners); 
              });  
            },8000);        
          }
          else{           
            search.partnerWithInterests(result, socketId, videoChatSockets, filter, userCountry, function(err,partners){
              console.log('partners length with interest is '+partners.length);
              // if there is no result
              if(partners === 'no partner found'){
                // search without interest
                setTimeout(function(){
                  search.partnerWithoutInterests(socketId, videoChatSockets, filter, userCountry, false, function(err,partners){
                    // if there is no result
                    if(partners === 'no partner found'){ res.send('no partner found'); return;}
                    findVideoPartnerError(partners); 
                  });
                },8000);
                return;
              }
              findVideoPartnerError(partners); 
            });
          }
        });
      }
      // if no interest fill
      else{
        console.log('error condition');    
        search.partnerWithoutInterests(socketId, videoChatSockets, filter, userCountry, false, function(err,partners){
          console.log('partner without interest');
          // if there is no result
          if(partners === 'no partner found'){ res.send('no partner found'); return;}
          findVideoPartnerError(partners); 
        });
      }
      // find partner function
      function findVideoPartnerError(partner){
        console.log('find video partner error');
        var userid = userid;
        var userSocket = socketId;
        var partnerSocket = partner.partner;
        var msg = partner.msg;
        // function
        search.joinVideoRoomError(userSocket, partnerSocket, videoChatSockets, function(err, result){
          if(result){
            var room = userSocket.id.substring(2);
            
              usersModel.findOne({socketId:partnerSocket.id},function(err, partnerUser){
              res.json({userId:userid,partnerId:partnerUser._id,room:room,msg:msg});
              io.sockets.in(room).emit('partnersConnected',{connection:'connected',msg:msg,room:room,ip:partnerSocket.ip});
            });
          }
          else{
            res.send('no partner found');
          }
        });
        // function
        //searchByFilter(filter,partnerSocket, userCountry, userLatitude, userLongtitude, partnerSocket.latitude, partnerSocket.longtitude, userid, socketId,partnerSocket.id,res);

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
// text chat
app.get('/api/session',function(req,res){
  var io = req.app.get('socketio'),
  userid = req.query.userId,
  socketId = io.sockets.connected['/#'+req.query.socketId],
  filter = req.query.filter,
  userCountry = req.query.country,
  userIP = req.query.ip,
  type = req.query.type,
  interest = req.query.interest;
  console.log('Total users: '+allSockets.length);
  // socket Instance
      // if user fill any interest
      if(socketId.interest){
        var int_usersInterest = socketId.interest;
        // search a partner based on interest
        interestsCtrl.searchInterest(int_usersInterest,function(err,result){ 
          // if there is no match then search partner without interests
          if(result.length === 0){
            setTimeout(function(){
              search.partnerWithoutInterests(socketId, allSockets, filter, userCountry, true, function(err,partners){
                // if there is no result
                if(partners === 'no partner found'){ res.send('no partner found'); return;}
                findPartner(partners); 
              }); 
            },8000);         
          }
          else{     
            // search partner with interests
            search.partnerWithInterests(result, socketId, allSockets, filter, userCountry, function(err,partners){
              // if there is no result
              if(partners === 'no partner found'){
                // search without interest after 8 seconds
                setTimeout(function(){
                  search.partnerWithoutInterests(socketId, allSockets, filter, userCountry, false, function(err,partners){
                    // if there is no result
                    if(partners === 'no partner found'){ res.send('no partner found'); return;}
                    findPartner(partners); 
                  });
                },8000);
                return;
              }
              findPartner(partners); 
            });
          }
        });
      }
      // if no interest fill
      else{
        search.partnerWithoutInterests(socketId, allSockets, filter, userCountry, false, function(err,partners){
          // if there is no result
          if(partners === 'no partner found'){ res.send('no partner found'); return;}
          findPartner(partners); 
        });
      }
      // find partner function
      function findPartner(partner){
        var userid = userid;
        var userSocket = socketId;
        var partnerSocket = partner.partner;
        var msg = partner.msg;
        // function
        search.joinRoom(userSocket, partnerSocket, allSockets, function(err, result){
          if(result){
            var room = userSocket.id.substring(2);
              usersModel.findOne({socketId:partnerSocket.id},function(err, partnerUser){
              res.json({userId:userid,partnerId:partnerUser._id,room:room,msg:msg});
              io.sockets.in(room).emit('partnersConnected',{connection:'connected',msg:msg,room:room,ip:partnerSocket.ip});
            });
          }
          else{
            res.send('no partner found');
          }
        });
      }

});

app.post('/api/fileUpload',upload.single('file'),function(req,res){
  new filesModel({
    userSession:req.body.user,
    filePath:req.file.filename,
    timing:req.body.timing
  }).save(function(err,file){
    if(err) throw err;
      io.sockets.emit('imageSent',file);
      res.send('Success');
  })
});
app.post('/api/deletePhoto/:id',function(req,res){
  var id = req.params.id;
  filesModel.findOne({_id: id}).
  exec(function(err,photo){
    filesModel.remove({_id: id}, function(err, data) {
      if(err) { 
         return res.send({status: "200", response: "fail"});
      }
      var path = 'public/uploads/'+photo.filePath; 
      fs.unlink(path, (err) => {
        if (err) throw err;
        console.log('complete');
      });
    });
  })
})
app.post('/api/webcamUpload',function(req,res){
  var data = req.body.img;
  var datetimestamp = Date.now();
  var ttl = req.body.timing;
  var user = req.body.user;
  var filename = datetimestamp +'-'+user+'.png';
    require("fs").writeFile("public/uploads/"+filename, data, 'base64', (err) => {
      if (err) throw err;
      new filesModel({
        userSession:user,
        filePath:filename,
        timing:ttl
      }).save(function(err,file){
        if(err) throw err;
          io.sockets.emit('imageSent',file);
      })
    });
});

app.post('/api/admin/takeScreenshot',function(req,res){  
  var rooms = req.body.rooms;
  var adminSocket = req.body.adminSocket;
  console.log('logging from take screenshot api, admin socket '+adminSocket);
  var datetimestamp = Date.now();
  var pathName = "./public/screenshots/"+datetimestamp;
  fs.mkdir(pathName);
  rooms.forEach(function(item){
    io.sockets.to(item.room).emit('shareYourScreenshot',{msg:'Share your screenshot please',timestamp:datetimestamp,adminSocket:adminSocket,room:item.room});
  });
  res.json({'datetimestamp':datetimestamp,rooms:rooms});
})
// admin screenshots
app.post('/api/admin/screenShot/videoChat',function(req,res){
  var data = req.body.img;
  var admin = req.body.adminSocket;
  var room = req.body.room;
  console.log('admin socket '+admin)
  var datetimestamp = req.body.timestamp;
  var user = req.body.user.substring(2);
  var filename = user+'.png';
  var writePathName = "public/screenshots/"+datetimestamp+'/';

  fs.writeFile(writePathName+filename, data, 'base64', (err) => {
    if (err) throw err;
  io.sockets.connected[admin].emit('screenShotUploaded',{image:"screenshots/"+datetimestamp+"/"+filename,id:filename,room:room});
    res.json({
      dir:__dirname,
      path:writePathName,
      name:filename
    })
  });
  //res.send('success');
});
app.post('/api/admin/grabAllScreenshots',function(req,res){
  var screenshots = [];
  var folderName = req.body.datetimestamp;
  var p = "public/screenshots/"+folderName;
  fs.readdir(p, function (err, files) {
      if (err) {
          console.log(err);
      }
      files.forEach(function (file) {
        screenshots.push({image:'screenshots/'+folderName+'/'+file,id:file});
      });
    res.send({'images':screenshots});
  });
})
// list of banned ips
app.get('/api/admin/bannedUsers',function(req,res){
  blockUsers.find(function(err, users){
    res.json(users);
  })
});
// ban ip
app.post('/api/admin/banUser',function(req,res){
  var sockets = req.body.sockets;
  console.log('Logging from ban user api');
  sockets.forEach(function(item){
    socketId = item.id;
    room = item.room;
    console.log(room);
    item = '/#'+item.id;
    var socket = io.sockets.connected[item]
    var ip = io.sockets.connected[item].ip;                       // detects the ip of the connected sockets of the room
    console.log(ip);
    new blockUsers({                                              // add sockets to the BAN table 
      'ip':ip
    }).save(function(err,user){
      if(err) throw err;
      console.log('user has been added to blocked table');
      console.log('room '+room+' by '+socketId);
      io.sockets.to(room).emit('msg', { type:'close',by: socketId});
      socket.emit('user ban',{msg:'You are banned'});
    })
    //disconnectSockets(sockets);
  })
    function disconnectSockets(sockets) {
      console.log('disconnecting all sockets');
      sockets.forEach(function(item){
        item = '/#'+item;
        var socket = io.sockets.connected[item];
        socket.disconnect();
      })
    }
    // emit message to the sockets that he/she get banned
    // disconnect the sockets
    res.send('success');
})
//verify ip
app.post('/api/verifyIp',function(req,res){
  var ip = req.body.ip;
  blockUsers.findOne({ip:ip},function(err,user){
    if(err) console.log('err');
    if(user === null){
      res.send('not banned');
    }
    else{
      res.send('banned');
    }
  })
})
// take screenshot
app.post('/api/screenShot/videoChat',function(req,res){
  var data = req.body.img;
  var datetimestamp = Date.now();
  var user = req.body.user;
  var filename = datetimestamp +'-'+user+'.png';
  fs.writeFile("public/screenshots/"+filename, data, 'base64', (err) => {
    if (err) throw err;
    res.json({
      dir:__dirname,
      path:"public/screenshots/",
      name:filename
    })
  });

})
app.post('/api/feedback',function(req,res){
  var formBody = req.body.data;
  console.log(formBody)
  var mailOptions = {
      from: '"Kosmochat"<'+smtpConfig.auth.user+'>', // sender address
      to: 'suraj.sudhera@walkwel.in', // list of receivers
      subject: 'Feedback', // Subject line
      html: '<html><body><table><tr><td>Name :</td><td>'+formBody.name+'</td></tr><tr><td>Email :</td><td>'+formBody.email+'</td></tr><tr><td>Message :</td><td>'+formBody.message+'</td></tr></table></body></html>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error)
      }
      else{
        res.json('email sent')
      }
  });
})
app.post('/api/activeusers',function(req,res){
  res.send(io.sockets.adapter.rooms);

})
app.get('*', function(req, res) {
  res.sendFile('/index.html', { root: __dirname }); // load our public/index.html file
});

var allSockets = [];
var videoChatSockets = [];
// dummy
var rooms = {},
    userIds = {};
    // dummy
io.sockets.on('connection',function(socket){
  // |||| -- video chat -- ||||
  var currentRoom, id;
  socket.on('init', function (data, fn) {
currentRoom = (data || {}).room || uuid.v4();
var room = rooms[currentRoom];
if (!data) {
  rooms[currentRoom] = [socket];
  id = userIds[currentRoom] = 0;
  fn(currentRoom, id);
  console.log('Room created, with #', currentRoom);
} else {
  if (!room) {
    return;
  }
  userIds[currentRoom] += 1;
  id = userIds[currentRoom];
  fn(currentRoom, id);
  room.forEach(function (s) {
    s.emit('peer.connected', { id: id });
  });
  room[id] = socket;
  console.log('Peer connected to room', currentRoom, 'with #', id);
}   
    
    // Handle init message
  });
  socket.on('msg', function (data) {
    var to = '/#'+data.to;

    //var to = parseInt(data.to, 10);
    console.log('to: '+data.to+' by '+data.by+'data type '+data.type);
      console.log('Redirecting message to', data.to, 'by', data.by);
      io.sockets.connected[to].emit('msg', data);

    // Handle message
  });
  // |||| -- video chat -- ||||

  // ||| onConnection push the socket to available array and create a new user |||

  // add filters in user
  socket.on('userAdditionalInfo',function(data){
    socket.filter = data.filter;
    socket.country = data.country;
    socket.userCountry = data.userCountry;
    socket.city = data.city;
    socket.ip = data.ip;
    socket.longtitude = data.long;
    socket.latitude = data.lat;
    socket.interest = data.interest;
    allSockets.push(socket);
    console.log(allSockets[socket]);
    new usersModel({
      'connected':false,
      'socketId':socket.id,
      'filter':data.filter,
      'country':data.country,
      'userCountry':data.userCountry,
      'city':data.city,
      'ip':data.ip,
      'longtitude':data.long,
      'latitude':data.lat,
      'interest':data.interest
      }).save(function(err,user){
        // if user fill any interest
        console.log('interest '+data.interest);
        if(data.interest){
          interestsCtrl.addInterest(data.interest,function(err,result){ 
            console.log(result);
            socket.emit('user',user);
          });
        }
        else{
          socket.emit('user',user);
        }
    });
  });
  // video user
  socket.on('video__userAdditionalInfo',function(data){
    videoChatSockets.push(socket);
    socket.filter = data.filter;
    socket.country = data.country;
    socket.ip = data.ip;
    socket.longtitude = data.long;
    socket.latitude = data.lat;
    new usersModel({
      'connected':false,
      'socketId':socket.id,
      'filter':data.filter,
      'country':data.country,
      'ip':data.ip,
      'longtitude':data.long,
      'latitude':data.lat
      }).save(function(err,user){
        user.type = data.type;
        socket.emit('user',user);
      //console.log(socket.id);
    });
  });


    socket.on('video__userAdditionalInfo__error',function(data){
    videoChatSockets.push(socket);
    socket.filter = data.filter;
    socket.country = data.country;
    socket.ip = data.ip;
    socket.longtitude = data.long;
    socket.latitude = data.lat;
    new usersModel({
      'connected':false,
      'socketId':socket.id,
      'filter':data.filter,
      'country':data.country,
      'ip':data.ip,
      'longtitude':data.long,
      'latitude':data.lat
      }).save(function(err,user){
        user.type = data.type;
        socket.emit('userWithError',user);
      //console.log(socket.id);
    });
      });
  // handle disconnection
  socket.on('disconnect',function(){
    io.sockets.to(socket.room).emit('chatEnd',{msg:'Your partner left the chat.'});
    //var socketRooms = socket.room;

    // if user fill any interest
    // this will remove insterests from the interests array
    if(socket.interest){
      interestsCtrl.deleteInterest(socket.interest,function(err,result){ 
        console.log(result);
      });
    };
    // this will indicate other partner of the room that his/her partner left the chat
    io.sockets.to(socket.rooms).emit('disconnected','disconnected');
    console.log('disconnect');  
    // this below code will remove the socket from the array
    var i = allSockets.indexOf(socket);
    if (i === -1)return;
    allSockets.splice(i, 1);
    var j = videoChatSockets.indexOf(socket);
    if (i === -1)return;
    videoChatSockets.splice(i, 1);
    //console.log('Pending users '+allSockets.length);
  })
  //console.log('session coonected');
  socket.on('send msg',function(data){
    console.log(data);
    io.sockets.to(data.room).emit('get msg',data);
  })
  socket.on('photoRequest',function(data){
    io.sockets.to(data.room).emit('photoRequest',data);
  })

  socket.on('photo opened',function(data){
    io.sockets.to(data.room).emit('photo opened',data);
  })
  socket.on('userDisconnect',function(data){
    io.sockets.to(data.room).emit('chatEnd',data);
  })

  socket.on('videoUserDisconnect',function(data){
    io.sockets.to(data.room).emit('msg',{type:'close',by:data.by});
    io.sockets.to(data.room).emit('peer.disconnected',{by:data.by});
    io.sockets.to(data.room).emit('chatEnd',data);
  })
  socket.on('onlyAudio',function(data){
    io.sockets.to(data.room).emit('streamUpdate',{'video':false,audio:true})
  })
  socket.on('sendingMsg',function(data){
    io.sockets.to(data.room).emit('userTyping',data);
  });

  socket.on('updatePeer',function(data){
    io.sockets.to(data.room).emit('updatePeer',data);
  })
  // new chat
  // this function will add the socket again to the array to find new partners
  socket.on('new chat',function(){
    allSockets.push(socket);
    console.log('user again added to the array');
  })
  socket.on('adminInit',function(){
    socket.emit('adminSocket',{adminSocket:socket.id});
  })

});