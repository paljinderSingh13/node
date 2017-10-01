// calling groups model
var users 			= require('../models/userModel.js'),	
	groups 			= require('../models/groupsModel.js'),
 	subjects		= require('../models/subjectModel.js'),
 	classes 		= require('../models/classesModel.js'),
 	invitations 	= require('../models/invitationsModel.js'),
 	dbFunctions 	= require('../functions/dbFunctions.js');

// exporting routes
module.exports = function(app){

	// user profile routes

	// update profile
	app.put('/profile/update', function (req, res){

		users.udpateProfile(req, function(result){

			res.send(result);;

		})

	})

	// change password
	app.put('/profile/changepassword', function(req, res){

		users.changePassword(req, function(result){

			res.send(result);

		})

	})

	// group routes starts

	// add new group
	app.post('/groups/create', function (req, res){

		groups.create(req, function(result){
			//console.log(result);
			res.send(result);
		})

	})

	// check availability group unique ID
	app.post('/groups/checkavailability', function (req, res){

		groups.isAvailable(req.body, function(result){
			
			//console.log(result);
			res.send(result);
		
		})

	})

	// getting all group list wrt user
	app.get('/groups/list', function (req, res){

		groups.list(req, function(result){

			res.send(result);
		})

	})

	// getting subject details wrt subjectID
	app.get('/groups/details/:groupId', function (req, res){

		groups.details(req.params.groupId, function(result){
		
			res.send(result);
		
		})

	})

	// updating group details
	app.put('/groups/update', function (req, res){

		groups.update(req.body, function(result){

			res.send(result);

		})

	})

	// deleting group 
	app.post('/groups/delete', function (req, res){
		//console.log(req.body);
		groups.deleteGroup(req.body, function(result){
		//	console.log(result);
			res.send(result); 

		})

	})
	// group routes ends

	// subjects routes starts
	app.post('/subjects/checkavailability', function (req, res) {
			
		subjects.isAvailable(req.body, function (result) {
				
			//console.log(result);
			res.send(result);

		})

	})

	// saving new subject
	app.post('/subjects/create', function (req, res){

		subjects.create(req, function (result) {
			
			res.send(result);

		})

	})
	
	// gettting all subjects
	app.get('/subjects/list', function (req, res){

		subjects.list(req, function(result){

			res.send(result);
		})

	}) 
	
	// getting subject details wrt subjectID
	app.get('/subjects/details/:subjectId', function (req, res){

		subjects.details(req.params, function(result){
		
			res.send(result);
		
		})
		

	})

	// updating subject details
	app.put('/subjects/update', function (req, res){

		subjects.update(req.body, function(result){

			res.send(result);

		})

	})

	// deleting subjct 
	app.post('/subjects/delete', function (req, res){
		
		subjects.deleteSubject(req.body, function(result){

			res.send(result);

		})

	})

	// getting user groups list along with subjects
	app.get('/subjects/getUserGroupList/:userId', function(req, res){

		subjects.getUserGroupList(req.params, function(result){

			res.send(result);

		})

	})
	// end subjects

	// classes routes


	// getting class list of current logged in user
	// checking availability

	app.get('/classes/list/', function(req, res){

		classes.list(req, function(result){

			res.send(result);

		})

	})


	app.post('/classes/checkavailability', function (req, res){
		
		classes.isAvailable(req.body, function (result){

			res.send(result);

		})

	})

	// saving classes
	app.post('/classes/save', function (req, res){

		classes.save(req, function(result){

			res.send(result);

		})

	})

	// getting class details wrt classID
	app.get('/classes/details/:classId', function (req, res){

		classes.details(req.params, function(result){
		
			res.send(result);
		
		})
		
	})

	// updating class
	app.put('/classes/update', function(req, res){

		classes.update(req.body, function(result){
			console.log(result);
			res.send(result);

		})

	})

	// deleting subjct 
	app.post('/classes/delete', function (req, res){
		
		classes.deleteClass(req.body, function(result){

			res.send(result);

		})

	})

	// invitation routes
	app.get('/invitations/list', function (req, res){

		invitations.list(req, function(result){

			res.send(result);

		})

	})

	// saving invite
	app.post('/invitations/save', function(req, res){

		invitations.save(req, function(result){

			res.send(result);

		})

	})

	// changing status of invitation
	app.put('/invitations/changeStatus', function(req, res){

		invitations.changeStatus(req, function(result){

			res.send(result);

		})

	})
}