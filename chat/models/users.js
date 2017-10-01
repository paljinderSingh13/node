var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');


var usersSchema = new Schema({
  sessId:String,
  connected:Boolean,
  socketId:String,
  filter:String,
  country:String,
  userCountry:String,
  city:String,
  interest:String,
  ip:String,
  longtitude:String,
  latitude:String
})


usersSchema.statics.random = function(callback) {
  this.count(function(err, count) {
    if (err) {
      return callback(err);
    }
    var rand = Math.floor(Math.random() * count);
    //this.findOne({connected:false}).skip(rand).exec(callback);
    this.findOne({connected:false}).exec(callback);
  }.bind(this));
};



var users = mongoose.model('users',usersSchema);




var UserInfo = new Schema({
  username: String,
  password: String
});

UserInfo.plugin(passportLocalMongoose);


var UserInfo = mongoose.model('userInfo', UserInfo);

module.exports = {
  users : users,
  admin : UserInfo
}


//57a8633248f1c01712e8015e