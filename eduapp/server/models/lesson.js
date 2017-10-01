var lessonSchema = new Schema({
                    _subid : { type: Schema.ObjectId, ref: 'subject' },
                    questions : [{ type: Schema.Types.ObjectId, ref: 'question' }],
                    tittle: { type: String, required: true},
                    description: String,  //, unique: true 
                    created_at: Date,
                    updated_at: Date
                  });

var lesson = mongoose.model('lesson', lessonSchema);


var createlesson = function(req , callback)
{
     var lessonData = new lesson({
              tittle: req.body.tittle,
              description: req.body.description,
              _subid: req.body._subid  
            });
      lessonData.save(req , function(err) {
        callback("del");
    });
}

var listlesson = function(callback){
	//callback('b','a');
   lesson.find({},function(err , data)
   	{	callback(data);
   		//console.log(data);
   	});
   //console.log(" List lesson");
}

var getlesson = function(id, callback){
     lesson.findById(id, callback); // 
 }

var updatelesson = function(req, callback){
	console.log(req._id);

lesson.findByIdAndUpdate(req._id, req, function(err, data)
 {
		callback("successfully update lesson");
 })
}

var dellesson = function(id, callback)
{
	lesson.findByIdAndRemove(id , callback);// {
	  //     if (err) throw err;
	  //   console.log('subject deleted!');
	  // });
}
/*module.exports.getSubject = function(id, callback){
     Subject.findById(id, callback); // 
 };*/

 module.exports = {
 	lesson:lesson,
 	listlesson:listlesson,
 	getlesson:getlesson,
 	updatelesson:updatelesson,
 	dellesson:dellesson,
  createlesson:createlesson};