// getting databse connection and schema 
var db 				= require('../config/db'),
	commonFunctions = require('../functions/common.js');

// creating schema
var classesSchema 	= db.schema({

	groupId 		: { type : db.schema.Types.ObjectId, ref : 'Groups' },
	subjectId		: { type : db.schema.Types.ObjectId, ref : 'Subjects' },
	name 			: String,
	clsid 			: String,
	startRollNumber	: Number,
	description 	: String,
	createdUser		: { type : db.schema.Types.ObjectId, ref : 'Users' },
	createdDate 	: { type : Date, default : Date.now },
	isActive 		: { type : Boolean, default : true }
	
}) 

// creating mongoose model
var Classes = db.mongoose.model('Classes', classesSchema);

// result variable
var result = {};

// function to check unique id availability
function isAvailable (formDetails, callback){

	Classes.findOne({
		'clsid' 	: formDetails.clsid,
		'groupId' 	: formDetails.groupId,
		'subjectId' : formDetails.subjectId
	})
		.exec(function (err, res) {
			
		if(err){
			//console.log(err);
			throw err;
		
		} else {
			//console.log(res);
			if(res){
				
				result.success = false;
				result.message = "Section already exists. Please try another one.";
				

				callback(result);
			} else {

				result.success = true;
				result.message = "";
				

				callback(result);
			}
		}
	})

}

// function to save a classw
function save (req, callback){

	var formDetails = req.body;

	commonFunctions.decodeToken(req.get('Authorization'), function(res){

		formDetails.createdUser = res._id;

	}) 

	var classes = new Classes(formDetails);

	classes.save(function(er, rs){

		if(er){
			
			throw er;
		} else {
			if(rs){

				details(rs._id, function(r){
					result.success = true;
					result.message = 'Section created successfully';
					result.details = r;
					callback(result);
				})
				
			} else {
				result.success = false;
				result.message = 'Cannot create Section';
				callback(result);
			}
			
			
		}

	})

}

// function to defaultSave a classw
function defaultSave (formDetails, callback){

	var classes = new Classes(formDetails);

	classes.save(function(er, rs){
		result.success = true;
		callback(result);
	})

}

// list all classes according to user id
function list(req, callback){

	commonFunctions.decodeToken(req.get('Authorization'), function (res){

		var createdUser = res._id;

		Classes.find({'createdUser':createdUser})
			.sort({ createdDate : -1 })
			.populate('createdUser', 'fullname')
			.populate('groupId', 'name')
			.populate('subjectId', 'name')
			.exec(function (e, r){

				if(e){
					throw e;
				} else {

					callback(r);

				}

			})

	})


}

// class details according to class id
function details(classId, callback){

	Classes.findById(classId)
		.populate('createdUser', 'fullname')
		.populate('groupId', 'name')
		.populate('subjectId', 'name')
		.exec(function (e, r){

			if(e){
				
				throw e;
			} else {
				
				callback(r);

			}

		})

}

// updating class details wrt class is
function update(formDetails, callback){

	Classes.update({'_id': formDetails._id}, formDetails,
		function(err, res){

			if(res){

				details(formDetails._id, function(rs){
					
					result.success = true;
					result.message = 'Section updated successfully';
					result.details = rs;

					callback(result);

				})

			} else {

				result.success = true;
				result.message = 'Cannot update Section';
				callback(result);

			}

	})
	
}

// deleting class 
function deleteClass(classId, callback){
	
	Classes.remove({'_id':classId._id})
		.exec(function (err, res){

			if(err){
				throw err;
			} else {

				if(res){

					result.success = true,
					result.message = 'Section Deleted successfully',
					result.details = '';
				} else {

					result.success = false,
					result.message = 'Cannot delete Section',
					result.details = '';
				}

				callback(result);
			}

		})

}

// exporting modules
module.exports = {

	Classes 	: Classes,
	isAvailable : isAvailable,
	save 		: save,
	defaultSave : defaultSave,
	list 		: list,
	details 	: details,
	update 		: update,
	deleteClass : deleteClass

}