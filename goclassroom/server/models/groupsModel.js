// getting databse connection and schema 
var db 				= require('../config/db'),
	dbFunctions 	= require('../functions/dbFunctions.js'),
	commonFunctions = require('../functions/common.js');

// creating groups schema
var groupSchema = new db.schema ({

	name				: String,
	unid 				: { type : String },
	address 			: String,
	about 				: String,
	createdUser			: { type: db.schema.Types.ObjectId, ref: 'Users' },
	createdDate			: { type : Date, default : Date.now },
	isApproved 			: { type : Boolean, default : true },
	approvedDate 		: { type : Date },
	adminRemarks 		: { type :  String },
	isRequestUpgrade	: { type : Boolean, default : false },
	isUpgraded 			: { type : Boolean, default : false },
	groupType 			: { type : String, default : 'Group' },				
	members 			: [{ 
							userId 		: { type : db.schema.Types.ObjectId, ref : 'Users' },
							joinedOn 	: { type : Date, default : Date.now },
							isActive	: { type : Boolean, default : true},
							role 		: Number   
						  }]

});

// creating model instance
var Groups = db.mongoose.model('Groups', groupSchema);

// creating result object
var result 			= {},
	groupDetails  	= {};

// function to check unique id availability
function isAvailable (unid, callback){

	Groups.findOne(unid).exec(function (err, res) {
			
		if(err){
			
			throw err;
		
		} else {

			if(res){
				//callback(true);
				result.success = false;
				result.message = "ID already exists. Please try another one.";
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

// function to create group
function create (req, callback){

	var formDetails = req.body;

	commonFunctions.decodeToken(req.get('Authorization'), function(res){
		
		formDetails.createdUser = res._id;

		if(res.role == 1 || res.role == 2){

			formDetails.isApproved = false;

		}
	
	});

	formDetails.members = [{ 'userId':formDetails.createdUser, 'role':1 }];

	var group 	= new Groups(formDetails);

	group.save(function (err, res){

		if(err){
			throw err;
		} else {

			details(res._id, function(res){
				
				result.success = true;

				result.message = "Group created successfully";

				result.details = res;

				callback(result);
			
			})
			
		}
	}) 

}



// function to get all groups created by current logged in user
function list (req, callback){

	commonFunctions.decodeToken(req.get('Authorization'), function (res){

		Groups.find({'createdUser':res._id})
			.sort({ createdDate: -1 })
			.populate('createdUser', 'fullname')
			.populate('members.userId', 'fullname')
			.exec(function (err, result){

				if(err){
					 throw err;
				} else {
					callback(result);
				}
			})

	})

}

// function to get group details wrt group id
function details(groupId, callback){
	
	Groups.findById(groupId)
		.populate('createdUser', 'fullname')
		.populate('members.userId', 'fullname')
		.exec(function (err, res){

			if(err){

				throw err;

			} else {

				callback(res);
			}

		})

}

// function for updating group details
function update(formDetails, callback){

	Groups.findById(formDetails._id)
		.exec(function (err, res){

			res.name 		= formDetails.name;
			res.address		= formDetails.address;
			res.about 		= formDetails.about;

			res.save(function (e, r){

				if (e){
					throw e;
				} else {

					if(r){
						
						result.success = true,
						result.message = 'Group updated successfully',
						result.details = '';
					
					} else {

						result.success = false,
						result.message = 'cannot update group',
						result.details = '';
					}

					callback(result);

				}

			})

		})

}

// deleting subject 
function deleteGroup(groupId, callback){
	
	Groups.remove({'_id':groupId._id})
		.exec(function (err, res){

			if(err){
				throw err;
			} else {

				if(res){

					dbFunctions.cascadeGroup(groupId._id, function(rs){
		
						if(rs){

							result.success = true,
							result.message = 'Group Deleted successfully',
							result.details = '';

						} else {
							result.success = false,
							result.message = 'cannot delete group',
							result.details = '';
						}
					})

				} else {

					result.success = false,
					result.message = 'Cannot delete group',
					result.details = '';
				}

				callback(result);
			}

		})

}

// function to create default group
function defaultCreate (userDetails, callback){
	
	if(userDetails.role == 1 || userDetails.role == 2){

		groupDetails.groupType = 'Institute';

	}

	groupDetails.name 			= userDetails.insname;

	groupDetails.address 		= userDetails.insaddress;

	groupDetails.isApproved 	= false;

	groupDetails.createdUser 	= userDetails._id; 

	groupDetails.members 		= [{ 'userId':userDetails._id, 'role':1 }];
	
	var group 	= new Groups(groupDetails);

	group.save(function (err, res){

		if(err){
			//console.log(err);
			throw err;
		
		} else {

			result.success = true;

			result.message = "Group created successfully";

			callback(result);
			
		}
	}) 

}

// getting all groups from db
function getAllGroups(callback){

	Groups.find({'groupType':'Group'})
		.sort({ createdDate: -1 })
		.populate('createdUser', 'fullname email phone')
		.exec(function (err, res){
			if(err){
				console.log(err); 
			 	throw err;
			}
			callback(res);
		})

}

// getting all instittes
function getAllInst(callback){

	Groups.find({'groupType':'Institute'})
		.sort({ createdDate: -1 })
		.populate('createdUser', 'fullname email phone')
		.exec(function (err, res){
			if(err){
				console.log(err); 
				throw err;	
			} 
			callback(res);
		})

}

// apprive institute
function approveInstitute(formDetails, callback){
	
	details(formDetails._id, function(res){

		res.isApproved 		= true;
		res.adminRemarks 	= formDetails.remarks;
		res.approvedDate 	= Date.now();

		res.save(function(er, rs){
			
			if(rs){
				result.success = true;
				result.message = "Institute Approved Successfully";
				
			} else {
				result.success = false;
				result.message = "Cannot Approve Institute";
			}
			callback(result);

		})

	})

}

// exporting function
module.exports = {

	Groups 				: Groups,
	isAvailable 		: isAvailable,
	create				: create, 
	list 				: list,
	details 			: details,
	update 				: update,
	deleteGroup 		: deleteGroup,
	defaultCreate 		: defaultCreate,
	getAllGroups 		: getAllGroups,
	getAllInst 			: getAllInst,
	approveInstitute 	: approveInstitute

}