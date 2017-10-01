var mongoose 	= require('mongoose'),
	schema 		= mongoose.Schema;

module.exports.mongoose = mongoose;
module.exports.schema 	= schema;

function connect(){

	mongoose.connect(process.env.CONNECTION_STRING);

} 

connect();

function disconnect(){

	mongoose.disconnect();

}