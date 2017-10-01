var express= require('express');
var app = express();


var mongodb = require('mongodb');
var mongoose = require('mongoose');

var bodyParser = require('body-parser');

 var mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  // Create your schemas and models here.
});

mongoose.connect('mongodb://localhost:27017/medical');

//{"_id":"56f8dcad1639089c1d648561","first_name":"fn","middle_name":"mn","last_name":"ln","adress":"ad","adress2":"ad1","city":"c","state":"s","country":"c","role":"admin","user_name":"usr","password":"pwd"},

var user = new mongoose.Schema({
  first_name: { type: String }
, middle_name: String
, last_name: String
, adress: String
, adress2: String
, city: String
, state: String
, country: String
, role: String
, user_name: String
, password: String
});

	var users = mongoose.model('users', user);

		var user = new users({
		  first_name: 'Thor'
		, middle_name: 'middlee name'
		});

	user.save(function(err, user) {
 	 if (err) return console.error(err);
 		 console.dir(user);
		});



app.listen(3000);

console.log("server running on port 300");