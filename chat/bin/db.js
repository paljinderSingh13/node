var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports.mongoose = mongoose;
module.exports.Schema = Schema;
connect();
function connect(){
	mongoose.connect('mongodb://localhost/kosmochat');
	//mongoose.connect('mongodb://heroku_ch0586m3:c1s60debtlg00ihpi1qbhbgivm@ds021650.mlab.com:21650/heroku_ch0586m3');
}
function disconnect(){
	mongoose.disconnect;
}	