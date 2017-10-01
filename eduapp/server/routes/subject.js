var express = require('express');
var router 	= express.Router();
//var app = express();
var Subject = require('../models/subject');

// end lesson script
router.post('/createSubject', function (req, res) {
    Subject.createSubject(req.body ,function(data){
      res.send("Subject created");
    })      
});

//SUBJECT LIST
router.get('/subjectList',function(req , res)
{
      Subject.listSubject(function(list)
      {       
          res.json(list);
      });  
})

  router.delete('/subject/:id', function (req, res) {
    var id = req.params.id;
    Subject.delSubject(id, function(data)
    {
      res.send("del subject");
    })
        
  });

router.get('/editSubject/:id', function (req, res) {
    var id = req.params.id;
    Subject.getSubject(id, function(err, data){
    res.json(data);
    });
});
//update Subject
router.put('/updateSubject/:id', function (req, res) {
   req.body._id = req.params.id;  
    Subject.updateSubject(req.body, function(err, data)
    {
      res.send("update subject");
    })
});

module.exports = router;
