// requiring database
var db 				= require('../config/db')
	bcrypt 			= require('bcryptjs'),
	commonFunctions = require('../functions/common'),
	groups 			= require('../models/groupsModel');

var adminSchema = new db.schema({

	username 	: String,
	password 	: String,
	fullname 	: String,
	email 		: String,
	isActive 	: { type : Boolean , default : true }

});

var Admin = db.mongoose.model('Admin', adminSchema);

var result = {};

var login = (formDetails, callback) => { 

	Admin.findOne({'username':formDetails.username}, 
		function(err, res){

			if(res){
				bcrypt.compare(formDetails.password, res.password,
					function(er, rs){
						if(rs){

							commonFunctions.encodeToken(rs, function(cb){

								result.success = true;
								result.message = "login Successfull";
								result.details = cb;

								callback(result);

							})
 
						} else {

							result.success = false;
							result.message = "Wrong username password";

							callback(result);

						}
					})
			} else {

				result.success = false;
				result.message = "Wrong username password";

				callback(result);

			}
		})

}

var allGroups = (req, callback)=>{

	groups.getAllGroups( function (result){
		callback(result)
	})

}

var allInst = (req, callback)=>{

	groups.getAllInst( function (result){
		callback(result);
	})

}

var approveInstitute = (formDetails, callback)=>{
	
	groups.approveInstitute(formDetails, (res)=>{
		callback(res);
	})
		
}

module.exports = {

	login 				: login,
	allGroups 			: allGroups,
	allInst 			: allInst,
	approveInstitute 	: approveInstitute

}