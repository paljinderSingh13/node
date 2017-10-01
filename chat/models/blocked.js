var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var blockUsersSchema = new Schema({
  ip:String
})



var blockUsers = mongoose.model('blockUsers',blockUsersSchema);


module.exports = {
  blockUsers : blockUsers
}


//57a8633248f1c01712e8015e