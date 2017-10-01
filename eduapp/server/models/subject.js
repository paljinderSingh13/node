
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var subjectSchema = new Schema({
                    subject: { type: String, required: true},
                    description: String,  //, unique: true 
                    created_at: Date,
                    updated_at: Date,
                    lessons : [{ type: Schema.Types.ObjectId, ref: 'lesson' }]
                  });

var Subject =  mongoose.model('subject', subjectSchema);

var createSubject = function(req , callback)
{
   var SubjectData = new Subject({
              subject: req.subject,
              description:  req.description             
            });
      SubjectData.save(req , function(err) {
        callback("del");
    });
}

var listSubject = function(callback){
	//callback('b','a');
   Subject.find({},function(err , data)
   	{	callback(data);
   		//console.log(data);
   	});
   //console.log(" List subject");
}

var getSubject = function(id, callback){
     Subject.findById(id, callback); // 
 }

var updateSubject = function(req, callback){
	console.log(req._id);

Subject.findByIdAndUpdate(req._id, req, function(err, data)
 {
		callback("successfully update subject");
 })
}

var delSubject = function(id, callback)
{
	Subject.findByIdAndRemove(id , callback);// {
	  //     if (err) throw err;
	  //   console.log('subject deleted!');
	  // });
}
/*module.exports.getSubject = function(id, callback){
     Subject.findById(id, callback); // 
 };*/

 module.exports = {
 	Subject:Subject,
 	listSubject:listSubject,
 	getSubject:getSubject,
 	updateSubject:updateSubject,
 	delSubject:delSubject,
  createSubject:createSubject};

