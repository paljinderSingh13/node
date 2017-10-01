// getting db and some common functions
var db 				= require('../config/db'),
	commonFunctions = require('../functions/common'),
	dbFunctions 	= require('../functions/dbFunctions.js');

// crating invitation schema
var invitationSchema = db.schema({

	fullname 			: String,
	email 				: String,
	phone				: Number,
	invitationType		: Number,
	role 				: Number,
	groupId 			: { type : db.schema.Types.ObjectId, ref : 'Groups' },
	subjectId			: { type : db.schema.Types.ObjectId, ref : 'Subjects' },
	message 			: String,
	createdUser			: { type : db.schema.Types.ObjectId, ref : 'Users' },
	invitationStatus 	: { type : String, defult : 'Sent' },
	createdDate 		: { type : Date, default : Date.now }

})

// initializing model
var Invitations = db.mongoose.model('Invitation', invitationSchema);

// result variable
var result = {};

// function to get all invitations wrt current logged in user 
function list(req, callback){

	commonFunctions.decodeToken(req.get('Authorization'), function(res){

		var userId = res._id;
			
		Invitations.find({'createdUser':userId})
			.populate('createdUser', 'fullname')
			.populate('groupId', 'name')
			.populate('subjectId', 'name')
			.exec(function (er, rs) {
				if(er){
					throw er;
				} else {
					callback(rs);
				}
			})

	})

}

function save(req , callback){

	var formDetails = req.body;

	commonFunctions.decodeToken(req.get('Authorization'), function(res){

		formDetails.createdUser = res._id;
		
	})

	Invitations(formDetails)
		.save(function (er, rs){

			if(er){
				throw er;
			} else {
				if(rs){

					invitationDetails(rs._id, function(details){

						details.invitationLink = req.protocol+'://'+req.hostname+'/#/invite/'+details._id;

						commonFunctions.sendMail(details, {'template':'newInvite', 'subject':'Invitation - Goclassrooms'});

					})
					
					result.success = true;
					result.message = "Invite Sent Successfully";
				} else {
					result.success = false;
					result.message = "Cannot send invitation. Please try again."
				}

				callback(result);

			}

		})

}

// function to get all invitations wrt invite id 
function invitationDetails(inviteId, callback){

	Invitations.findById(inviteId)
		.populate('createdUser', 'fullname')
		.populate('groupId', 'name')
		.populate('subjectId', 'name')
		.exec(function (er, rs) {
			if(er){
				throw er;
			} else {

				if(rs.role == '1'){

					rs.inviteRole = 'Institute Owner';

				} else if(rs.role == '2'){

					rs.inviteRole = 'Teacher';

				} else {

					rs.inviteRole = 'Student';

				}

				callback(rs);
			}
		})

}
// exporting modules
module.exports = {

	list 				: list,
	save 				: save,
	invitationDetails 	: invitationDetails, 

}