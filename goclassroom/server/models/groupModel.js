
module.exports = {
	group 				: Group,
	createGroup			: createGroup,
	findUserGroup		: findUserGroup,
	addNewGroupMessage 	: addNewGroupMessage,
	getGroupMessages	: getGroupMessages,
	markRead 			: markRead,
	getUnread 			: getUnread
}

var db = require('../config/db');

var groupSchema = new db.schema({

	name		: String,
	createdBy	: {   type : db.schema.Types.ObjectId,  ref : 'Users'},
	createdAt	: {   type : Date, default : Date.now},
	isActive	: {   type : Boolean, default : true },
	members		: [ { type : db.schema.Types.ObjectId, ref : 'Users' }]

})

var Group = db.mongoose.model('Group', groupSchema);

var groupMessageSchema = new db.schema({
	message : String,
	createdAt : Date,
	groupId : "objectId",
	sender : {
		id : "objectId",
		name: String,
		isRead: {type: Boolean,default:true},
		isArchive : {type: Boolean,default:false}
	},
	receiver : [{
		user : { type : db.schema.Types.ObjectId, ref : 'Users' },
		isRead: {type: Boolean,default:false},
		isArchive : {type: Boolean,default:false}
	}],
	filename:String
})

var GroupMessage = db.mongoose.model('GroupMessage' , groupMessageSchema);

function createGroup(data , cb){

	var newGroup = {
		name		: data.group.name,
		createdBy	: data.createdBy,
		members		: data.group.members
	};

	newGroup = new Group(newGroup);
	newGroup.save(function(err,res){
		if(err) throw error 
			cb(null,res)
	})

}

function findUserGroup(userId,cb){

	Group.find({members:userId})
	.exec(function(err,data){
		if(err) throw err 
			cb(null,data)
	})

}

function addNewGroupMessage(message,cb){
	var newMessage = new GroupMessage(message);
	newMessage.save(function(err,data){
		if(err) throw error;
			cb(null,data)
	})
}

function getGroupMessages(groupId,cb){

	GroupMessage.find({groupId:groupId})
		.exec(function(err,data){
			if(err) throw err
				cb(data);
		})
}

function markRead(groupId,user,cb){
	GroupMessage
	.update(
		{ receiver				: { $elemMatch : {user : user._id} }, groupId : groupId },
		{ "receiver.$.isRead" 	: true},
		{ multi					: true }
	)
	.exec((err,data) => {
		if(data){
			console.log(data)
	   		res.json(data)
		}
    })
   //console.log("groupId = "+groupId +" user._id = "+user._id)
   /*GroupMessage.find({receiver:{$elemMatch: {user : user._id} }, groupId : groupId })
   .exec((err,data) => {
		if(data){
			console.log(data)
	   		//res.json(data)
		}
   })*/
}

function getUnread(user,cb){
	GroupMessage
	/*.aggregate([{$match:{'receiver.id' : db.mongoose.Types.ObjectId(user._id)} }])*/
	.aggregate([
		{ $match :
			{
				receiver				: { 
					$elemMatch 	: { 
						user 	: db.mongoose.Types.ObjectId(user._id) ,
						isRead 	: false 
					} 
				}
				//'receiver.user' 		: db.mongoose.Types.ObjectId(user._id) , 
				//"receiver.$.isRead" 	: false 
			}
		},
		{ $group:
	    	{ _id: "$groupId", count: { $sum: 1 } }
		}
	])
	.exec( (err, data) => {
		if(err)  throw err
		if(data) cb(null, data) 
	})
}

