// requiring database file
var db 				= require('../config/db'),
	commonFunctions = require('../functions/common.js'),
	jwt 			= require('jwt-simple'),
	bcrypt 			= require('bcryptjs'),
	groupsModel 	= require('../models/groupsModel.js');

// creating user collection schema
var userSchema = new db.schema({

	fullname 			: String,
	email 				: String,
	dob 				: Date,
	country_code		: String,
	phone				: { type : Number, 	unique : true },
	password 			: { type : String, 	default : null },
	role 				: Number,
	insname 			: String,
	insaddress 			: String,
	otp 				: Number,
	isOtpVerified 		: { type : Boolean, default : false },
	isEmailVerified 	: { type : Boolean, default : false },
	createdDate 		: { type : Date, 	default : Date.now },
	isEnabled 			: { type : Boolean, default : true}, 
	resetPasswordToken	: { type : String, 	default : null}

});

// initializing user model
var Users = db.mongoose.model('Users', userSchema);

// final returnig result variable
var result = {};

// registration function
function registerUser(userDetails, callback) {
	
	isAlreadyRegistered(userDetails.phone, function(response){

		if(response){

			isOTPsend(userDetails.phone, function(response){

				if(response.isOtpVerified){

					result.success 	= false;
					result.message 	= 'User is registerd and verified';
					result.details 	= response;

					callback(result); 
	
				} else {
					
					result.success 	= false;
					result.message 	= 'User is registerd but not verified';
					result.details 	= response;

					callback(result);

				}

			})

		} else {

			var otp = Math.floor(Math.random()*1000000);
			
			userDetails.otp = otp;
			
			userDetails.country_code = userDetails.country_code.dial_code;
			
			var user = new Users(userDetails);

			user.save(function (err, response){

				if(err){
					
					throw err;

				} else {

					commonFunctions.sendSMS(userDetails.phone, 'new_registration', function(resp){

						//console.log(resp);

					})

					commonFunctions.sendMail(response, {'template':'register', 'subject':'OTP for account activation - Goclassrooms'}, function (resp){

						//console.log(resp);

					})

					var details = {'userId':response._id, 'phone':response.phone, 'otp':response.otp};

					result.success 	= true;
					result.message 	= 'User registered';
					result.details 	= jwt.encode(details, process.env.APP_SECRET);

					callback(result);

				}
			})
		}
	})
	
}

// function to check whether the user is already registered with the phone number
function isAlreadyRegistered(phone, callback){

	Users.findOne({'phone' : phone}).exec(function (err, response){
		
		if(err){

			throw err;

		} else if(response){

			callback(true);

		} else {

			callback(false);

		}
	})

}

// check if otp is send to user or not
function isOTPsend(phone, callback){

	Users.findOne({'phone':phone}, 'otp isOtpVerified').exec(function (err, response){

		if(err){

			throw err;

		} else {
		
			callback(response);
		
		}
	})

}

// function for updating the isVerified check i user verifies the otp
function verifyotp(req, callback){

	var userDetails = getUserDetails(req);

	Users.findById(userDetails.userId, 'isOtpVerified', function (err, response){

		response.isOtpVerified = true;

		response.save(function (err, res){
		
			if(err){

				throw err;
			
			}

			var details = {'_id':response._id, 'isOtpVerfied':true};

			result.success 	= true;
			result.message 	= 'Verified Successfully';
			result.details 	= jwt.encode(details, process.env.APP_SECRET);

			callback(result);
		
		})
	})

}

// save password to database
function savePassword(req, callback){

	var userDetails = getUserDetails(req);
	
	generateHash(req.body.password, function(res){

		Users.findById(userDetails._id , function (err, response){
			
			response.password = res;
			
			response.save(function (err, cd){

				if(err){

					throw err;
				
				} else {
					
					result.success 	= true;
					result.message 	= 'Password Set Successfully';
					result.details 	= '';
					
					if(response.role == 1 || response.role == 2){

						groupsModel.defaultCreate(response, function(rs){

							callback(result);

						})

					} else {

						callback(result);
						
					}
				}
			})
		})
	})	

}

// login function
function doLogin(body, callback){
	
	Users.findOne({'phone':body.phone}, 
		'fullname email dob phone role isOtpVerified isEmailVerified password createdDate isEnabled',
		 function (err, user) {

			if(user){

				bcrypt.compare(body.password, user.password, function (er, rs){

					if(er){

						throw er;

					} else {

						if(rs){
							//console.log(user);
							result.success 	= true;
							result.message 	= 'Login Successfull';
							result.details 	= jwt.encode(user, process.env.APP_SECRET);

							callback(result);
						
						} else {

							//console.log('inside if');

							result.success 	= false;
							result.message 	= 'Wrong username password. Please try again with valid credentails.';
							result.details 	= '';

							callback(result);
						}
					}
				})
			} else {
				//console.log('outside else');
				result.success 	= false;
				result.message 	= 'Wrong username password. Please try again with valid credentails.';
				result.details 	= '';

				callback(result);

			}
	
	})

}

// getting userdetails from authorization header token
function getUserDetails(req){

	var userDetails = jwt.decode(req.get('Authorization'), process.env.APP_SECRET);

	return userDetails;

}

// updating user profile
function updateProfile(req, callback){

	var formDetails = req.body;

	commonFunctions.decodeToken(req.get('Authorization'), function(res){

		Users.findById(res._id)
			.exec(function (er, rs){

				callback(rs);

			})

	})

}

// change user password
function changePassword(req, callback){

	var formDetails = req.body;

	commonFunctions.decodeToken(req, get('Authorization'), function(res){

		User.findById(res_id, 'password')
			.exec(function (er, rs){

				callback(rs);

			})

	})

}

/* ------ Helper functions to make life easy -------- */

// bcrypt function to hash a string (passwords)
function generateHash(password, callback){

	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(password, salt, function(err, hash) {
	       callback(hash);
	    });
	});

}

// exporting modules
module.exports = {

	Users 				: Users,
	registerUser 		: registerUser,
	isAlreadyRegistered : isAlreadyRegistered,
	isOTPsend			: isOTPsend,
	verifyotp 			: verifyotp,
	savePassword 		: savePassword,
	doLogin 			: doLogin,
	updateProfile		: updateProfile,
	changePassword		: changePassword,
	getUserDetails		: getUserDetails

}