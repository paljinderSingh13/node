var express = require('express'),
	app     = express(),
	server  = require('http').createServer(app),
	io      = require('socket.io').listen(server);


module.exports = function(app){
	app.set('socketio', io);
}