// requiring environment variables
require('dotenv').config();
// require dependencies
var express 	   	= require('express'),
	bodyParser 	   	= require('body-parser'),
	app            	= express(),
	admin 			= express(),
	mongoose 	   	= require('mongoose'),
	server         	= require('http').createServer(app),
	io             	= require('socket.io').listen(server),
  	jwt            	= require('jwt-simple'),
  	MessageModel   	= require('./server/models/messageModel'),
	GroupModel     	= require('./server/models/groupModel');


app.use(express.static('src')); 
admin.use(express.static('src'));

app.use(bodyParser.json());
admin.use(bodyParser.json());

// requiring routes
require('./server/routes/mainServerRoutes')(app);
require('./server/routes/baseServerRoutes')(app,io);
require('./server/routes/adminServerRoutes')(admin);
// starting public server
server.listen(3000, function(){
  console.log('public listening on 3000');
});
// starting admin server
admin.listen(3100, function(){
  console.log('admin listening on 3100');
});