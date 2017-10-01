// includes
var in_array = require('in_array');

var allInterests = [];

// make array of string interests
function makeArray(interest, callback){
	var interestArray = [];
	// search if there is one interest or more
	if(interest.search(",") === -1){
		interestArray.push(interest);
	}
	// split interests string to array
	else{
		var interests = interest.split(",");
		// add interest to array
		for(i = 0;i < interests.length; i++){
			interestArray.push(interests[i]);
		}
	}
	callback(null,interestArray);
}
// add interests to array
function addInterest(interest,callback){
	makeArray(interest, function(err,interestArray){
		for(i = 0;i < interestArray.length; i++){
			allInterests.push(interestArray[i]);
		}
	});

	callback(null,allInterests);
}
// delete interest from array
function deleteInterest(interest,callback){
	makeArray(interest, function(err,interestArray){
		// remove interests to array
		for(ia = 0;ia < interestArray.length; ia++){
			var i = allInterests.indexOf(interestArray[ia]);
			if (i === -1){return};
			allInterests.splice(i, 1);
		}
	});

	callback(null,allInterests);
}

// search partner with interests
function searchInterest(interest,callback){
	var result = [];
	makeArray(interest, function(err,interestArray){
		// remove current socket interests from array to search
		for(ia = 0;ia < interestArray.length; ia++){
			var i = allInterests.indexOf(interestArray[ia]);
			if (i === -1){return};
			allInterests.splice(i, 1);
		}
		// search each item of array
		for(var i = 0; i < interestArray.length; i++){
			if(in_array(interestArray[i], allInterests) === true){
				result.push(interestArray[i]);
			}	
		}
		// add current socket interests back to array after search
		for(var j = 0; j < interestArray.length; j++){
			allInterests.push(interestArray[j]);
		}
		
	});
	callback(null,result);
}

module.exports = {
	makeArray : makeArray,
	addInterest : addInterest,
	allInterests : allInterests,
	deleteInterest : deleteInterest,
	searchInterest: searchInterest
}
