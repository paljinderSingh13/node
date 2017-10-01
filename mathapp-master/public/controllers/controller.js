var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {
    console.log("Hello World from controller");


var refresh = function() {
  $scope.hidUpsub   =  true;
  $scope.hidSaveSub = false;
  $scope.hidUpLes   = true;
  $scope.shwLes     = true;
  $scope.shwQuesbtn = true;
  $scope.upQuesBtn  = true;

  $http.get('/subjectlist').success(function(response) {
   // console.log(response);
    $scope.subjectlist = response;
    $scope.sub = "";
  });
};

refresh();

// Question Script Start
 //add question 

 $scope.quesForm = function(id)
{
    $scope.ques = {'_lesid':id};
}
$scope.addQues = function() 
{
 // console.log($scope.subject);
  $http.post('/createQuestion', $scope.ques).success(function(response) {
    console.log(response);
  });
};

//quesView
$scope.quesView = function(id)
{ 
    $http.get('/quesView/'+id).success(function(response) {
      console.log(response);
   $scope.quesList = response;
 });
}

$scope.editQues = function(id) {
  $scope.shwQuesbtn = false;
  $scope.upQuesBtn  = false;
  // console.log(id);
  $http.get('/editQues/' + id).success(function(response) {
    //$scope.checked =true;
   console.log(response);
   $scope.ques = response;
    //console($scope);
    //$scope.subject.subject = response.subject;
  });
};  

//remove Ques
 $scope.removeQues = function(id)
 {

   $http.delete('/removeQues/' + id).success(function(response) {
    //refresh();
  });
 }
//update Ques


$scope.updateQues = function() {
    $scope.shwQuesbtn = true;
  $scope.upQuesBtn  = true;
  console.log($scope.ques._id);
  $http.put('/updateQues/' + $scope.ques._id, $scope.ques).success(function(response) {
    $scope.ques ="";
  })
};

// Question Script end


//create subject
$scope.addSubject = function() {
 // console.log($scope.subject);
  $http.post('/createSubject', $scope.sub).success(function(response) {
    console.log(response);
    refresh();
  });
};
// Lesson Script
//lesson form
$scope.lessonForm = function(subid)
{
     $scope.hidUpLes   = true;
     $scope.shwLes     = true;
     $scope.les = {'_subid': subid};
  //   $http.post('/createLesson/'+subid, $scope.les).success(function(response) {
  //   console.log(response);
  //   //refresh();
  // });
}
// create lesson
$scope.addLesson = function()
{
   console.log($scope.les);
   
    $http.post('/createLesson', $scope.les).success(function(response) {
    console.log(response);
    //refresh();
  });
}


// Lesson View
$scope.lessonView = function(id)
{ 
    $http.get('/viewLesson/'+id).success(function(response) {
      console.log(response);
   $scope.lessonList = response;
 });
}
 
 $scope.removeLesson = function(id)
 {

   $http.get('/lesson/' + id).success(function(response) {
    //refresh();
  });
 }

 //editLesson

 $scope.editLesson = function(id) {
  $scope.hidUpLes   = false;
  $scope.shwLes     = false;
  $http.get('/editLesson/' + id).success(function(response) {
    //$scope.checked =true;
   console.log(response);
   $scope.les = response;
    //console($scope);
    //$scope.subject.subject = response.subject;
  });
};  
//update Lesson

$scope.updateLesson = function() {
  console.log($scope.les._id);
  $http.put('/updateLesson/' + $scope.les._id, $scope.les).success(function(response) {
    //$scope.checked =false;
    refresh();
  })
};

$scope.deselectLesson = function() {
  $scope.les = "";
}
// Lesson Script end


$scope.remove = function(id) {
  console.log(id);
  $http.delete('/subject/' + id).success(function(response) {
    refresh();
  });
};

$scope.edit = function(id) {

  $scope.hidUpsub =false;
  $scope.hidSaveSub =true;

  $http.get('/editSubject/' + id).success(function(response) {
   console.log(response);
   $scope.sub = response;
    //console($scope);
    //$scope.subject.subject = response.subject;
  });
};  

$scope.update = function() {
  $scope.hidUpsub   = true;
  console.log($scope.sub._id);
  $http.put('/updateSubject/' + $scope.sub._id, $scope.sub).success(function(response) {
    refresh();
  })
};

$scope.deselect = function() {
  $scope.sub = "";
}

}]);﻿