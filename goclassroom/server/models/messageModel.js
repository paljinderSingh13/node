module.exports = {
	messages 		: Message,
	getMessages 	: getMessages,
	addNewMessage 	: addNewMessage,
	markRead 		: markRead,
	getUnread 		: getUnread
}

// requiring database file
var db 				= require('../config/db');

// creating message collection schema
var messageSchema = new db.schema({
	message : String,
	createdAt : "date",
	sender : {
		id : "objectId",
		name: String,
		isRead: {type: Boolean,default:true},
		isArchive : {type: Boolean,default:false}
	},
	receiver : {
		id : "objectId",
		name: String,
		isRead: {type: Boolean,default:false},
		isArchive : {type: Boolean,default:false}
	},
	filename:String
})

var Message = db.mongoose.model("Message",messageSchema);



function getMessages(users,cb){
	var messages = [];
	Message
	.find({'receiver.id' :users.partner,'sender.id' :users.user})
	.exec(function(err,user1){

		for (var i of user1){

			messages.push(i)

		}
		Message
		.find({'receiver.id' :users.user,'sender.id' :users.partner})
		.exec(function(err,user2){

			for (var j of user2) {

				messages.push(j)
			}

			cb(messages)
		})
	})

}

function markRead(users,cb){
	Message
	.update(
		{'receiver.id' 		: users.user, 'sender.id' : users.partner },
		{'receiver.isRead' 	: true },
		{multi				: true }
	)
	.exec((err,data) => {
		if(data){
	   		res.json(data)
		}
   })
}

function getUnread(user,cb){
	console.log(user)
	Message
	/*.aggregate([{$match:{'receiver.id' : db.mongoose.Types.ObjectId(user._id)} }])*/
	.aggregate([
		{ $match :
			{
				'receiver.id' 		: db.mongoose.Types.ObjectId(user._id) , 
				'receiver.isRead' 	: false 
			}
		},
		{ $group:
	    	{ _id: "$sender.id", count: { $sum: 1 } }
		}
	])
	.exec( (err, data)=> {
		if(err)  throw err
		if(data) cb(null, data) 
	})
}

function addNewMessage(message,cb){
	var newMessage = new Message(message);
	newMessage.save(function(err,data){
		if(err) throw error;
			cb(null,data)
	})
}