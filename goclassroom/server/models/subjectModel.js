// getting databse connection and schema 
var db 				= require('../config/db'),
	classes 		= require('../models/classesModel'),
	commonFunctions = require('../functions/common.js');

// creating schema
var subjectSchema = db.schema({

	name 			: String,
	subid 			: String,
	description  	: String,
	isActive		: { type : Boolean, default : true},
	createdUser		: { type : db.schema.Types.ObjectId, ref : 'Users' },
	groupId 		: { type : db.schema.Types.ObjectId, ref : 'Groups' },
	isFree 			: { type : Boolean, default : true },
	fees 			: { type : Number, default : null },
	duration 		: 	{ 
							dvalue : Number , dtype : String	
 						},
 	weekdays 		: [],
	createdDate 	: { type : Date, default : Date.now }

});

// creating subject insatnce
var Subjects = db.mongoose.model('Subjects', subjectSchema);

// creating variables
var result 	= {};
var section = {};

// function to check unique id availability
function isAvailable (formData, callback){

	Subjects.findOne({
		'subid' 	: formData.subid,
		'groupId' 	: formData.groupId
	}).exec(function (err, res) {
			
		if(err){
			
			throw err;
		
		} else {
			//console.log(res);
			if(res){
				
				result.success = false;
				result.message = "Subject already exists. Please try another one.";
				result.details = "";

				callback(result);
			} else {

				result.success = true;
				result.message = "";
				result.details = "";

				callback(result);
			}
		}
	})

}

// functio for creating subjects
function create(req, callback){
	
	var formDetails = req.body;
	
	commonFunctions.decodeToken(req.get('Authorization'), function(res){
		
		formDetails.createdUser = res._id;

	});
	
	var subject = new Subjects(formDetails);

	subject.save(function (err, res){

		if(err){
			throw err;
		} else {
			if(res){

				details(res._id, function (rs){
					
					result.success = true,
					result.message = 'Class created successfully',
					result.details = rs;
					callback(result);

					// section.groupId 		= rs.groupId._id;
					// section.subjectId 		= rs._id;
					// section.name 			= formDetails.section.name;
					// section.clsid 			= 'Section I';
					// section.startRollNumber = formDetails.section.startRollNumber;
					// section.createdUser 	= formDetails.createdUser;

					// classes.defaultSave(section, function(r){
						
						

					// })

				})

				
			} else {
				
				result.success = false,
				result.message = 'cannot save subject',
				result.details = '';
				
				callback(result);
			}
			
		}
	})	
	
}

// function for gettings all subjects
function list(req, callback){

	commonFunctions.decodeToken(req.get('Authorization'), function(res){

		var createdUser = res._id;

		Subjects.find({'createdUser':createdUser})
			.sort({ createdDate: -1 })
			.populate('createdUser', 'fullname')
			.populate('groupId', 'name')
			.exec(function(err, res){
			
			if(err){

				throw err;

			} else {

				result.success = true,
				result.message = 'Subjects Found',
				result.details = res;

				callback(result);
			}

		})
	});
	
}

// function to get subject details wrt subject id
function details(subjectId, callback){

	Subjects.findById(subjectId)
		.populate('createdUser', 'fullname')
		.populate('groupId', 'name')
		.exec(function (err, res){

			if(err){

				throw err;

			} else {

				callback(res);
			}

		})

}

// function for updating subject details
function update(formDetails, callback){
	
	Subjects.update({'_id' : formDetails._id}, formDetails, 
		function(err, res){

			if(res){
				details(formDetails._id, function(res){

					if(res){
						result.success = true,
						result.message = 'class updated successfully',
						result.details = res;
					} else {
						result.success = false,
						result.message = 'cannot update class',
						result.details = '';
					}
					callback(result);
				})
				
			} else {
				result.success = false,
				result.message = 'cannot update class',
				result.details = '';
				callback(result);
			}
			
	})

}

// deleting subject 
function deleteSubject(subjectId, callback){
	
	Subjects.remove({'_id':subjectId._id})
		.exec(function (err, res){

			if(err){
				throw err;
			} else {

				if(res){

					result.success = true,
					result.message = 'Subject Deleted successfully',
					result.details = '';
				} else {

					result.success = false,
					result.message = 'Cannot delete subject',
					result.details = '';
				}

				callback(result);
			}

		})

}

// exporting modules
module.exports = {

	Subjects 			: Subjects,
	isAvailable 		: isAvailable,
	create  			: create,
	list 				: list,
	details 			: details,
	update				: update,
	deleteSubject		: deleteSubject,

}
