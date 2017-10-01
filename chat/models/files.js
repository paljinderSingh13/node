var mongoose = require('mongoose');
var random = require('mongoose-random');
var Schema = mongoose.Schema;

var fileSchema = new Schema({
  userSession:String,
  filePath:String,
  timing:Number
})






var file = mongoose.model('file',fileSchema);

module.exports = file;

//57a8633248f1c01712e8015e