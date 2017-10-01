var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var interestsSchema = new Schema({
  user:String,
  interest:String
})


var interests = mongoose.model('interests',interestsSchema);

module.exports = {
  interests : interests
}

//57a8633248f1c01712e8015e