// file to get some common database related queries
var userObj 	= require('../models/userModel.js'),
	groupObj 	= require('../models/groupsModel.js'),
	subjectObj 	= require('../models/subjectModel.js'),
	classesObj 	= require('../models/classesModel.js');


// deleting subjects (function called while deleting groups or subjects)
function cascadeGroup(groupId, callback){
	
	// deleting subjects wrt group
	subjectObj.Subjects.remove({'groupId' : groupId})
		.exec(function (err, res){

			if(res){
				
				// deleting classes wrt group
				classesObj.Classes.remove({'groupId' : groupId})
					.exec(function (err, res){

						if(res){
							callback(true)
	
						} else {
							callback(false);
						}
						
					});
			}

		});

}

// create default class
function createDefaultSection(section, callback){

	callback(section);
	// classesObj.Class.defaultSave(section, function (res){

	// 	callbak(section);

	// })

}

function getAllGroups(callback){

	groupObj.getAllGroups({'groupType':'Group'})
		.populate('createdUser', 'fullname')
		.exec(function(err, res){
			if(err){
				throw err;
			} else {
				callback(res);
			}
		})

}

function getAllInst(callback){

	groupObj.getAllInst({'groupType':'Institute'})
		.populate('createdUser', 'fullname')
		.exec(function(err, res){
			if(err){
				throw err;
			} else {
				callback(res);
			}
		})

}
// exporting functions
module.exports = {

	cascadeGroup			: cascadeGroup,
	createDefaultSection 	: createDefaultSection,
	getAllGroups			: getAllGroups,
	getAllInst				: getAllInst 

}