/* common functions that are used in entire system should be place here */
// accuiring config file common function
var config 	= require('../config/commonConfigs.js'),
	jwt 	= require('jwt-simple');

// function to send sms's to users
function sendSMS(phone, type, callback){

	// place SMS gateway code here
	callback(true);

} 

// function to send emails
function sendMail(details, settings, callback){

	config.mail(details, settings, function(response){

		callback(response);

	})
}

// decode token
function decodeToken(token, callback){

	var details = jwt.decode(token, process.env.APP_SECRET);

	//console.log(details);
	callback(details);

}

// encode new token
function encodeToken(details, callback){

	var token = jwt.encode(details, process.env.APP_SECRET);

	callback(token);

}

// exporting functions
module.exports = {

 	sendSMS 	: sendSMS,
 	sendMail	: sendMail,
 	decodeToken	: decodeToken,
 	encodeToken : encodeToken

}