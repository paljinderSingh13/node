var users = require('../models/userModel');
var MessageModel = require('../models/messageModel');
var fs = require('fs');
var multer = require('multer');
var dir = './src/public/uploads/';
var GroupModel = require('../models/groupModel');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

var storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
      cb(null, dir)
  },
  filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, datetimestamp+'-' +file.originalname)
  }
});
var upload = multer({
  storage:storage
})

module.exports  = function(app,io){

	// user registration
	app.post('/api/register', checkAuth, function (req, res){

		users.registerUser(req.body, function(result){

			res.send(result);

		});

	})

	// otp verification
	app.post('/api/verifyotp', function (req, res){

		users.verifyotp(req, function(result){

			res.send(result);

		})

	})

	// save password
	app.post('/api/savepassword', function (req, res){

		users.savePassword(req, function(result){

			res.send(result);

		})

	})

	// login
	app.post('/api/login', function (req, res){

		users.doLogin(req.body, function(result){

			//console.log(result);
			res.send(result);

		})

	})
	
	// checkAuth middlewere
	function checkAuth(req, res, next){

		//console.log(req.get('Authorization'));

		next();

	}

	/*routes made by user*/

	//get all available chat partners
	app.get('/availablechatpartner',function(req, res, next){
		//console.log(req.get('Authorization'));

		var currentUser = users.getUserDetails(req);

		users.Users.find({_id:{ $ne:currentUser._id}}).exec(function(err,users){
			//console.log(users)
			res.users = users;
			next();

		})
	}, function(req, res){

		console.log('get groups')
		var currentUser = users.getUserDetails(req);
		//console.log('sdalgj')

		GroupModel.findUserGroup(currentUser._id,function(err,group){
			res.json({users:res.users, group:group})
		})
	})

	//get all unread messages
	app.post('/unreadmessages', 
		getUnreadUserMessages, 
		getUnreadGroupMessages, 
		function(req,res){
			res.json(res.user);
	})

	//get user messages
	app.post('/usermessages',function(req,res){

		var users = req.body

		MessageModel.getMessages(users,function(data){

			res.json(data)

		});

		MessageModel.markRead(users,function(data){
			console.log("message Updated")
		})

	})

	//get group messages
	app.post('/groupmessages',function(req,res){

		var groupId = req.body.groupId;
		var user = req.body.user;

		GroupModel.getGroupMessages(groupId,function(data){

			res.json(data)

		});

		GroupModel.markRead(groupId,user,function(data){

			res.json(data)

		});
	})

	//file upload need a middle ware
	app.post('/upload',upload.single('file'),function(req,res){
		var msg = req.body;
		if(msg.receiver.members){ //check if group

	        var message = {

	          message     : msg.message,
	          createdAt   : msg.createdAt,
	          groupId     : msg.receiver._id,
	          sender      : { 
	            id        : msg.sender.id,
	            name      : msg.sender.fullname
	          },
	          receiver    : [],
	          filename 	:req.file.filename

	        }

	        for(var item of msg.receiver.members){
	        	//console.log(item)
	        	if(item != msg.sender.id){

		          	var userDetails = {
		            	user : item
		          	}

		          	message.receiver.push(userDetails)
	        	}

	        }

	        GroupModel.addNewGroupMessage(message,function(err,data){
        		if(err) throw err
	          	if(data){

					io.emit('groupmsg',data)

					res.json(data)

	          	}
	        })
	    }
	    else{
			var message = {
	          message     : msg.message,
	          createdAt : msg.createdAt,
	          sender    : { 
	            id      : msg.sender.id,
	            name    : msg.sender.fullname
	          },
	          receiver  : {
	            id      : msg.receiver._id,
	            name    : msg.receiver.fullname
	          },
	          filename 	:req.file.filename
	        }

			MessageModel.addNewMessage(message,(err,data) =>{
				if(err) throw err

				if(data){

					io.emit('msg',data)

	  				res.json(data)
				}
			});
	    }
		
	})

	//create group 
	app.put('/creategroup',function(req,res){	

		var body = req.body;

		GroupModel.createGroup(body,function(err,data){

			console.log('done')

		})

	})

	/*=============================================
	====== handling socket for real time chat =====
	===============================================*/

	//listening to socket
	io.on('connection', function(socket){
		
	  	socket.on('msg',function(msg){
	  		if(msg.message != "" && msg.message ){

		      	if(msg.receiver.members){ //check if group
		      		//console.log("group messages")
			        var message = {
			          message     : msg.message,
			          createdAt   : msg.createdAt,
			          groupId     : msg.receiver._id,
			          sender      : { 
			            id        : msg.sender.id,
			            name      : msg.sender.fullname
			          },
			          receiver    : []
			        }

			        for(var item of msg.receiver.members){
			        	//console.log(item)
			        	if(item != msg.sender.id){

				          	var userDetails = {
				            	user : item
				          	}

				          	message.receiver.push(userDetails)
			        	}

			        }

			        GroupModel.addNewGroupMessage(message,function(err,data){
			        	if(err) throw err
						if(data){

							io.emit('groupmsg',data)

						}
			        })

				}
				else{ // if person
			      	
			      	//console.log('add message')
		      		//console.log(msg.createdAt)
			        var message = {
			          message   : msg.message,
			          createdAt : msg.createdAt,
			          sender    : { 
			            id      : msg.sender.id,
			            name    : msg.sender.fullname
			          },
			          receiver  : {
			            id      : msg.receiver._id,
			            name    : msg.receiver.fullname
			          }
			        }

			        MessageModel.addNewMessage(message,function(err,data){
		        		if(err) throw err
			          if(data){

			            io.emit('msg',data)

			          }
			        })
			      	

		      	}

	      	}
	  	})
	});

	// sending index file for public
	app.get('*', function(req, res){

		res.sendFile('index.html', {root : './src/public'});

	});

}

function getUnreadUserMessages(req, res, next){
	var user = req.body.user;
	MessageModel.getUnread(user, (err, data)=>{
		res['user'] = data;
		next();
	})
}
function getUnreadGroupMessages(req, res, next){
	var user = req.body.user;
	GroupModel.getUnread(user, (err, data)=>{
		data.map((ele, idx) =>{
			res.user.push(ele)
		})
		next();
	})
}
function groupMessage(){

}