var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/myappdatabase');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bodyParser = require('body-parser');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
var subjectSchema = new Schema({
                    subject: { type: String, required: true},
                    description: String,  //, unique: true 
                    created_at: Date,
                    updated_at: Date,
                    lessons : [{ type: Schema.Types.ObjectId, ref: 'lesson' }]
                  });

var lessonSchema = new Schema({
                    _subid : { type: Schema.ObjectId, ref: 'subject' },
                    questions : [{ type: Schema.Types.ObjectId, ref: 'question' }],
                    tittle: { type: String, required: true},
                    description: String,  //, unique: true 
                    created_at: Date,
                    updated_at: Date
                  });

var questionSchema = new Schema({
                    _lesid : { type: Schema.ObjectId, ref: 'lesson' },
                    question: { type: String, required: true},
                    created_at: Date,
                    updated_at: Date
                  });


var subject = mongoose.model('subject', subjectSchema);
var lesson = mongoose.model('lesson', lessonSchema);
var question = mongoose.model('question', questionSchema);

 question.find().exec(function(err, data){
              console.log(data);
            });


app.post('/createQuestion', function (req , res ){

          var questionObj = new question({
              question: req.body.question,
              _lesid: req.body._lesid  
            });
            
            questionObj.save(function (err) {
              if (err) return handleError(err);
              console.log('question created successfully');
              // thats it!
            });

            question.find().exec(function(err, data){
              console.log(data);
            })
             res.send("question created successfully'");

});

//quesView
app.get('/quesView/:id',function(req , res)
{
  var id = req.params.id;
  question.find({_lesid:id}).exec(function(err, ques)
  {
  res.json(ques);
  });
})

//edit Question
app.get('/editQues/:id', function (req, res) {
    var id = req.params.id;
   // res.send(id);

    question.findById(id, function(err, data) {
      if (err) throw err;
  // object of the user
  res.json(data);
      console.log(data);
    });
  })
//update Ques

 app.put('/updateQues/:id', function (req, res) {
  var id = req.params.id;
 // console.log(req.body.name);
  question.findByIdAndUpdate(id, { question: req.body.question }, function(err, data) {
  if (err) throw err;
  res.send("ques successfully updated");
  // we have the updated user returned to us
  console.log(data);
  });
});
//removeQues

  app.delete('/removeQues/:id', function (req, res) {
    var id = req.params.id;
    question.findByIdAndRemove(id, function(err) {
      if (err) throw err;
    console.log('ques deleted!');
  });

    res.send('ques deleted!');
    
  });
//Question Script end

//lesson script
//create lesson
app.post('/createLesson', function (req , res ){

          var lesson1 = new lesson({
              tittle: req.body.tittle,
              description: req.body.description,
              _subid: req.body._subid  
            });
            
            lesson1.save(function (err) {
              if (err) return handleError(err);
              console.log('lesson created successfully');
            });
             res.send("cr lesson");

});
//view lesson list 
app.get('/viewLesson/:id',function(req , res)
{
  var id = req.params.id;
  lesson.find({_subid:id}).exec(function(err, leson)
  {
  res.json(leson);
  });
})
//Delete lesson
app.get('/lesson/:id', function (req,res){
  id = req.params.id;

    lesson.findByIdAndRemove(id, function(err) {
      if (err) throw err;
  });
res.send('del');
})

//editLesson
app.get('/editLesson/:id', function (req, res) {
    var id = req.params.id;
    lesson.findById(id, function(err, data) {
      if (err) throw err;
  res.json(data);
    });
  })
 //updateLesson

 app.put('/updateLesson/:id', function (req, res) {
  var id = req.params.id;
  lesson.findByIdAndUpdate(id, { tittle: req.body.tittle, description: req.body.description }, function(err, user) {
  if (err) throw err;
  res.send("Lesson successfully updated");
  });
});

// end lesson script
app.post('/createSubject', function (req, res) {
             var subject = mongoose.model('subject', subjectSchema);
             module.exports = subject;
             var SubjectData = new subject({
              subject: req.body.subject,
              description:  req.body.description             
            });

             SubjectData.save(function(err) {
              if (err) throw err;
                res.send("subject created successfully");
            });
});

//SUBJECT LIST
app.get('/subjectList',function(req , res)
{
            
            var subjectList = mongoose.model('subject', subjectSchema);
            subjectList.find({}, function(err, subjects)
            {
          res.json(subjects);
            } )

})



  app.delete('/subject/:id', function (req, res) {
    var id = req.params.id;
    var del = mongoose.model('subject', subjectSchema);
    del.findByIdAndRemove(id, function(err) {
      if (err) throw err;
    console.log('subject deleted!');
  });

    res.send('subject deleted!');
    
  });

app.get('/editSubject/:id', function (req, res) {
    var id = req.params.id;
    var edit = mongoose.model('subject', subjectSchema);

    edit.findById(id, function(err, subject) {
      if (err) throw err;
  res.json(subject);
      console.log(subject);
    });

});
//update Subject
app.put('/updateSubject/:id', function (req, res) {
  var id = req.params.id;
  var updateSubject = mongoose.model('subject', subjectSchema);
  updateSubject.findByIdAndUpdate(id, { subject: req.body.subject, description: req.body.description }, function(err, user) {
  if (err) throw err;
  res.send("Subject successfully updated");
  console.log(user);
  });
});


app.listen(3000);
console.log("Server running on port 3000");
