var express= require('express');

var mongodb = require('mongodb');
//var mongoose = require('mongoose');

var bodyParser = require('body-parser');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/medical';

// Use connect method to connect to the Server

//var db = mongojs('mydb',['new_table']);
var app = express();

var file = require('file-system');
var fs = require("fs");


var geocoderProvider = 'google';
var httpAdapter = 'https';
// optional 
var extra = {
    apiKey: 'AIzaSyAHu73RGuCOe2yD_kW5WNyGiSZvODNsNfc', // for Mapquest, OpenCage, Google Premier 
    formatter: null         // 'gpx', 'string', ... 
};
 
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
//async = require("async");


var d = new Date();
var curr_date = d.getDate();
var curr_month = d.getMonth()+1;
var curr_year = d.getFullYear();
 
 date = curr_month+"-"+curr_date+"-"+curr_year;


app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());


// MongoClient.connect(url, function (err, db)
//      {
//         db.collection("medicine_shop").remove();

//      });
///////////__________________________Final Search result___________________________________________////////////////


  // MongoClient.connect(url, function (err, db) {
  //   med_shop = db.collection('medicine_shop');
  //       var o_id = new mongodb.ObjectID('5729a36c34cf330c2aeaca80');
  //      med_shop.remove( {_id: o_id});
  //    //var o_id = new mongodb.ObjectID('5742f0ad089680841867108f');
  //    // medicine_shop = db.collection('medicine_shop');
  //               //  medicine_shop.remove( { _id : o_id} );
  // });


app.post("/result", function (req , res)
{
try { 
   lat     = req.body.lati; //30.7191317; //
   longi   = req.body.longi; // 76.72061599999999; //
   medids  = req.body.medid;//'57289b57284ca5e81100e9aa'; //

//declar variable
var maxPrice = 0;
var minPrice =  100000;
  shopname=[];
 MongoClient.connect(url, function (err, db) {
   price =  db.collection('medicine_price');
    price.find({"medid": medids}).toArray(function(err, items) {
              // res.json({user: items});
               med =  db.createCollection('medicine_shop');

    medicine_shop = db.collection('medicine_shop');
    medicine_shop.createIndex( { loc : "2dsphere" } );

   medicine_shop.find( { loc:
                         { $near :
                           { $geometry :
                              { type : "Point" ,
                                coordinates : [longi , lat] } ,
                             $maxDistance : 5000
                      } } } ).toArray(function (err , list){
                          //

                          for(var obj in list)
                          {
                           // console.log(list[obj]._id);
                            mid = list[obj]._id;
                              for(var nxt in items)
                              {   
                                    if(items[nxt].shopid==mid)
                                    {  
                                      if ( maxPrice < items[nxt].rate)
                                      {
                                        maxPrice = items[nxt].rate;
                                      } 


                                      if ( minPrice > items[nxt].rate)
                                      {
                                        minPrice = items[nxt].rate;
                                      } 

                                                 
                                      list[obj].price = items[nxt].rate;
                                        shopname.push(list[obj]);
                                    }
                              }

                          }
                            if(minPrice==100000)
                              { minPrice =0;}

                                 res.send({user:shopname,maxprice:maxPrice,minprice:minPrice});
//}));
                          console.log(req);
                       
                       });
                   });    
              });
        
        } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
});

///////////__________________________Final Search result___________________________________________////////////////


app.get("/loglat", function (req , res){

 geocoder.geocode('phase 7 mohali', function(err, data) {
  res.json(data);
    
});
});

//---------------Link Medicine to Medical sho & price-----// 

app.post("/addPrice" , function (req , res){
try{
   MongoClient.connect(url, function (err, db)
     {
        req.body.status= "review";
       med_price =  db.collection('medicine_price');
       med_price.insert(req.body);
       res.send("insert price");
     });
   } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});

//---------------Link Medicine to Medical sho & price-----// 

//----------------------Medicine Price -----------------------//



app.get("/get_price" , function (req , res)
{
   try { 
  MongoClient.connect(url, function (err, db)
     {

        db.createCollection('medicine_price');
      med_price =  db.collection('medicine_price');
      med_price.find().toArray(function (err , data){
          
                res.json(data);
            
          
      });
     });
  } catch (e) { 
                   res.json({'msg':'no data found'});
                 }

});

//****************************************************************************SUBMIT MEDICINE DETAIL******************************************************************

app.post("/submit_medicine_detail" , function (req , res){
try{
      MongoClient.connect(url, function (err, db)
         {
            if(req.body.shop_image)
            {    
                  // original_data     = req.body.shop_image;
                  // var image_origial = "image.jpg";
                  // fs.readFile(image_origial, function(err, original_data){
                  //     fs.writeFile('image_orig.jpg', original_data, function(err) {});
                  //     //var base64Image  = original_data.toString('base64');
                  //     var decodedImage = new Buffer(original_data, 'base64');
                  //     fs.writeFile('image_decoded.jpg', decodedImage, function(err) {});
                  // });


            }
            db.createCollection('submit_medicine_detail');
            temp_table = db.collection('submit_medicine_detail');
            req.body.create_on = date;
            temp_table.insert(req.body);


         });

    res.send("Medicine Detail Added Successfully");
} catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
});
app.get("/get_medicine_detail", function (req , res){

  try{
     MongoClient.connect(url, function (err, db)
         {
          temp_table = db.collection('submit_medicine_detail');
            temp_table.find().toArray(function (err , data)
            {
                //res.json(data);
               res.json(data);
               
            });

         }); 
         } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      } 
     

});



//****************************************************************************SUBMIT TEST DETAIL******************************************************************

app.post("/submit_test_detail" , function (req , res){
try{
      MongoClient.connect(url, function (err, db)
         {
            /* if(req.body.shop_image)
            {    
                   original_data     = req.body.shop_image;
                   var image_origial = "image.jpg";
                   fs.readFile(image_origial, function(err, original_data){
                       fs.writeFile('image_orig.jpg', original_data, function(err) {});
                       var base64Image  = original_data.toString('base64');
                      var decodedImage = new Buffer(original_data, 'base64');
                       fs.writeFile('image_decoded.jpg', decodedImage, function(err) {});
                   });

	
            } */
            db.createCollection('submit_test_detail');
            temp_table = db.collection('submit_test_detail');
            req.body.create_on = date;
            temp_table.insert(req.body);


         });

    res.send("Test Detail Added Successfully");

    } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});
app.get("/get_test_detail", function (req , res){
  try{
     MongoClient.connect(url, function (err, db)
         {
          temp_table = db.collection('submit_test_detail');
            temp_table.find().toArray(function (err , data)
            {
               res.json(data);
               
            });

         });  
     } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});


//****************************************************************************SUBMIT PROCEDURE DETAIL******************************************************************

app.post("/submit_procedure_detail" , function (req , res){
  try{
      MongoClient.connect(url, function (err, db)
         {
            if(req.body.shop_image)
            {    
                  // original_data     = req.body.shop_image;
                  // var image_origial = "image.jpg";
                  // fs.readFile(image_origial, function(err, original_data){
                  //     fs.writeFile('image_orig.jpg', original_data, function(err) {});
                  //     //var base64Image  = original_data.toString('base64');
                  //     var decodedImage = new Buffer(original_data, 'base64');
                  //     fs.writeFile('image_decoded.jpg', decodedImage, function(err) {});
                  // });


            }
            db.createCollection('submit_procedure_detail');
            temp_table = db.collection('submit_procedure_detail');
            req.body.create_on = date;
            temp_table.insert(req.body);


         });

    res.send("Procedure Detail Added Successfully");
    } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});
app.get("/get_procedure_detail", function (req , res){

    try{
     MongoClient.connect(url, function (err, db)
         {
          temp_table = db.collection('submit_procedure_detail');
            temp_table.find().toArray(function (err , data)
            {
                
               res.json(data);
               
            });

         });  

     } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});



//***************************************************************************SUBMIT PRICE************************************************************************
app.get("/get_price_detail", function (req , res){
  try{
     MongoClient.connect(url, function (err, db)
         {
          temp_table = db.collection('medicine_price');
            temp_table.find().toArray(function (err , data)
            {
                
               res.json(data);
               
            });

         });  
     } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});
app.post("/submit_price" , function (req , res){
  try{

  var  priceData ={};
  MongoClient.connect(url, function (err, db)
     {
      //priceData ={"name":"name121"};
    if(!req.body.medicine_id)
        {
            med_name =  req.body.medicine_name;
            med_data = {"medicine_name" : med_name , "create_on" : req.body.medicine_date ,  "status" : "review"};

          if(req.body.salt_name)
          {
              med_data.salt_name = req.body.salt_name;
          }
        if(req.body.potency)
          {
            med_data.potency = req.body.potency;
          }
         
          db.collection('medicine').insert(med_data , function (err, records) {
               if (err) throw err;
               priceData.medid =  records.ops[0]._id;
             
                      if(!req.body.shop_id)
                              {

                                  adrs = req.body.shop_name+" "+req.body.shop_address+" "+req.body.city+" "+req.body.state+" "+req.body.zipcode;
                                  geocoder.geocode(adrs, function(err, data) {
                                              lati  =    data[0].latitude;
                                              longi =    data[0].longitude;
                                              //res.json(lati+"" +longi);
                               shopData = { "shopname" :   req.body.shop_name ,
                                         "address1"   :   req.body.shop_address,
                                         "city"       :   req.body.city,
                                         "state"      :   req.body.state,
                                         "zipcode"    :   req.body.zipcode
                                        };  


                                        shop = db.collection("medicine_shop");
                                        shop.createIndex( { 'loc' : "2dsphere" } );
                                        shop.insert({
                                                        loc : { type: "Point", coordinates: [ lati, longi ] },
                                                        shopData
                                                      }, function (err , shop){
                                                      priceData.shopid = shop.ops[0]._id;
                                                     // res.send(priceData.shopid);

                                                      priceData.price = req.body.medicine_price;
                                                      priceData.status = "review";
                                                 //db.createCollection('medicine_price');
                                                 med_price =  db.collection('medicine_price');
                                                 med_price.insert(priceData);
                                                 res.send(priceData);


                                                  });
                                                
                                            });

                               

                              }else{ priceData.shopid = req.body.shop_id;
                                      priceData.price = req.body.medicine_price;
                                      priceData.status = "review";
                                      med_price =  db.collection('medicine_price');
                                                 med_price.insert(priceData);
                                                 res.send(priceData);


                                }

            // res.send(priceData);             
                                                // med_price =  db.collection('medicine_price');
                                                //  med_price.insert(priceData);
                                                //  res.send("successfully Add Price");
                 });
            //res.send(abc);

            
             
        }else{
                priceData.medid = req.body.medicine_id;
                if(req.body.shop_id)
                {
                                     priceData.shopid = req.body.shop_id;
                                      priceData.price = req.body.medicine_price;
                                      priceData.status = "review";
                                      med_price =  db.collection('medicine_price');
                                                 med_price.insert(priceData);
                                                 res.send(priceData);
                }

                if(!req.body.shop_id)
                              {

                                  adrs = req.body.shop_name+" "+req.body.shop_address+" "+req.body.city+" "+req.body.state+" "+req.body.zipcode;
                                  geocoder.geocode(adrs, function(err, data) {
                                               lati  =    data[0].latitude;
                                              longi =    data[0].longitude;
                                              //res.json(lati+"" +longi);
                               shopData = { "shopname" :   req.body.shop_name ,
                                         "address1"   :   req.body.shop_address,
                                         "city"       :   req.body.city,
                                         "state"      :   req.body.state,
                                         "zipcode"    :   req.body.zipcode
                                        };  


                                        shop = db.collection("medicine_shop");
                                        shop.createIndex( { 'loc' : "2dsphere" } );
                                        shop.insert({
                                                        loc : { type: "Point", coordinates: [ lati, longi ] },
                                                        shopData
                                                      }, function (err , shop){
                                                      priceData.shopid = shop.ops[0]._id;
                                                     // res.send(priceData.shopid);

                                                      priceData.price = req.body.medicine_price;
                                                      priceData.status = "review";
                                                 //db.createCollection('medicine_price');
                                                 med_price =  db.collection('medicine_price');
                                                 med_price.insert(priceData);
                                                 res.send(priceData);


                                                  });
                                                
                                            });

                               

                              }


            }

       

           

          
     });
} catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});

//////////-----------------------------------------------ADD & GET MEDICINE SHOP-----------------MEDICINE PRICE ---------------------------------------------------------------------//

app.post("/add_medicine_shop", function (req , res){
  try{

 MongoClient.connect(url, function (err, db)
     {            

                   adrs = req.body.shop_name+" "+req.body.shop_address+" "+req.body.city+" "+req.body.state+" "+req.body.zipcode;
                     geocoder.geocode(adrs, function(err, data) {
                                lati  =    data[0].latitude;
                                 longi =    data[0].longitude;

                                 // shopData = { "shopname" :   req.body.shop_name ,
                                 //         "address"   :   req.body.shop_address,
                                 //          "city"       :   req.body.city,
                                 //         "state"      :   req.body.state,
                                 //         "zipcode"    :   req.body.zipcode
                                 //        }; 


                                           shop = db.collection("medicine_shop");
                                            shop.createIndex( { 'loc' : "2dsphere" } );
                                            shop.insert({
                                              "shopname" :   req.body.shop_name ,
                                               "address"   :   req.body.shop_address,
                                                "city"       :   req.body.city,
                                               "state"      :   req.body.state,
                                               "zipcode"    :   req.body.zipcode,
                                              loc :  [longi, lati ] 
                                                 
                                          });
                                                res.send("shop inserted");
                                           });

			/* shop.find().toArray(function(err , shoplist){ loc : { type: "Point", coordinates: [ lati, longi ] }
               res.json(shoplist);
			});

			db.createCollection("medicine", function(err, collection){
			if (err) throw err;

			console.log("Created medicine");
			console.log(collection);
			});
			});

			MongoClient.connect(url, function (err, db) {
			med =  db.collection('medicine');
			med.remove(); */
      
});
} catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
 });

 
app.get("/get_medicine_shop" , function (req ,res)
{
  try{
      MongoClient.connect(url, function (err, db)
     {
        shop = db.collection("medicine_shop");
        shop.find().toArray(function(err , shoplist){
              res.json(shoplist);
          });
     });

      } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});



//*******************************************************************ADD & GET TEST LAB**********************************************************



app.post("/add_test_lab", function (req , res){

try{
 MongoClient.connect(url, function (err, db)
     {            
		//test =  db.createCollection('test_lab');	
		
	
                   adrs = req.body.lab_name+" "+req.body.lab_address+" "+req.body.city+" "+req.body.state+" "+req.body.zipcode;
                     geocoder.geocode(adrs, function(err, data) {
                                lati  =    data[0].latitude;
                                 longi =    data[0].longitude;

                                 // shopData = { "shopname" :   req.body.shop_name ,
                                 //         "address"   :   req.body.shop_address,
                                 //          "city"       :   req.body.city,
                                 //         "state"      :   req.body.state,
                                 //         "zipcode"    :   req.body.zipcode
                                 //        }; 


                                           lab = db.collection("test_lab");
                                            lab.createIndex( { 'loc' : "2dsphere" } );
                                            lab.insert({
                                              "labname" :   req.body.lab_name ,
                                               "address"   :   req.body.lab_address,
                                                "city"       :   req.body.city,
                                               "state"      :   req.body.state,
                                               "zipcode"    :   req.body.zipcode,
                                              loc :  [longi, lati ] 
                                                 
                                          });
                                                res.send("lab inserted");
                                           });

			/* shop.find().toArray(function(err , shoplist){ loc : { type: "Point", coordinates: [ lati, longi ] }
               res.json(shoplist);
			});

			db.createCollection("medicine", function(err, collection){
			if (err) throw err;

			console.log("Created medicine");
			console.log(collection);
			});
			});

			MongoClient.connect(url, function (err, db) {
			med =  db.collection('medicine');
			med.remove(); */
});
} catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
 });
 
 app.get("/get_test_lab" , function (req ,res)
{
  try{
      MongoClient.connect(url, function (err, db)
     {
        lab = db.collection("test_lab");
		
      lab.find().toArray(function(err , lablist){
              res.json(lablist);
          });
		  
     });
      } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});
 
 
 //**********************************************************************ADD & GET PROCEDURE HOSPITAL***********************************************

 
 app.post("/add_procedure_hospital", function (req , res){
try{
 MongoClient.connect(url, function (err, db)
     {            
				procedure =  db.createCollection('procedure_hospital');
                   adrs = req.body.hospital_name+" "+req.body.hospital_address+" "+req.body.city+" "+req.body.state+" "+req.body.zipcode;
                     geocoder.geocode(adrs, function(err, data) {
                                lati  =    data[0].latitude;
                                 longi =    data[0].longitude;

                                 // shopData = { "shopname" :   req.body.shop_name ,
                                 //         "address"   :   req.body.shop_address,
                                 //          "city"       :   req.body.city,
                                 //         "state"      :   req.body.state,
                                 //         "zipcode"    :   req.body.zipcode
                                 //        }; 


                                           hospital = db.collection("procedure_hospital");
                                            hospital.createIndex( { 'loc' : "2dsphere" } );
                                            hospital.insert({
                                              "hospitalname" :   req.body.hospital_name ,
                                               "address"   :   req.body.hospital_address,
                                                "city"       :   req.body.city,
                                               "state"      :   req.body.state,
                                               "zipcode"    :   req.body.zipcode,
                                              loc :  [longi, lati ] 
                                                 
                                          });
                                                res.send("hospital inserted");
                                           });

			/* shop.find().toArray(function(err , shoplist){ loc : { type: "Point", coordinates: [ lati, longi ] }
               res.json(shoplist);
			});

			db.createCollection("medicine", function(err, collection){
			if (err) throw err;

			console.log("Created medicine");
			console.log(collection);
			});
			});

			MongoClient.connect(url, function (err, db) {
			med =  db.collection('medicine');
			med.remove(); */
});
} catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
});

 
 
 app.get("/get_procedure_hospital" , function (req ,res)
{
  try{
      MongoClient.connect(url, function (err, db)
     {
        hospital = db.collection("procedure_hospital");
		
      hospital.find().toArray(function(err , hospitallist){
              res.json(hospitallist);
          });
     });
      } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});
 

///////////////--------------------State Cities Data Start Here ------------------------/////////////

app.post("/get_cities", function (req , res){
try{
  sid = req.body.state_id;
  console.log(sid);
  //res.send("respond");
  MongoClient.connect(url, function (err, db) {
    cities =   db.collection('cities');
     //        //var regexValue='\.*'+med_name+'\.'; '^'+med_name, 'i'
            cities.find({"state_id": sid}).toArray(function(err, items) {
               res.json({user: items});
           });

  });
  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }


});

app.get("/getcities", function (req , res)
{
  try{
   MongoClient.connect(url, function (err, db) {
     s =  db.collection('cities');
      s.find().toArray(function (err , citylist){
                res.json({user:citylist});
              });
          });
   } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});

app.get("/getstates", function (req , res)
{
  try{
   MongoClient.connect(url, function (err, db) {
     s =  db.collection('state');
      s.find().toArray(function (err , statelist){
                res.json({user:statelist});
              });
          });
   } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});

///--------------------------------------------Get Latitutde and Longitude for Medicine(Address)------------------------------------------------

app.post("/getlatlong", function (req , res){

try{
    lat = req.body.lat;
    longi = req.body.longi;
//res.send("lat"+lat +" long-"+longi)
      // MongoClient.connect(url, function (err, db)
      //      {
      //        medicine_shop = db.collection('medicine_shop');
      //        medicine_shop.createIndex( { loc : "2dsphere" } );
      //         medicine_shop.find( { loc:
      //                          { $near :
      //                            { $geometry :
      //                               { type : "Point" ,
      //                                 coordinates : [ longi , lat ] } ,
      //                              $maxDistance : 100000
      //                       } } } ).toArray(function (err , list){
                               
      //                             res.json({user:list});
      //                       });

      //       });

 MongoClient.connect(url, function (err, db) {
     //med =  db.createCollection('medicine_shop');

    medicine_shop = db.collection('medicine_shop');
    medicine_shop.createIndex( { loc : "2dsphere" } );

   medicine_shop.find( { loc:
                         { $near :
                           { $geometry :
                              { type : "Point" ,
                                coordinates : [longi , lat] } ,
                             $maxDistance : 250000
                      } } } ).toArray(function (err , list){
                          console.log(list);
                            res.send(list);
                      });    
                    });
 } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
  });
  
  //****************************************************************Get Latitutde And Longitude for TEST(Address)********************************************
  
  
  app.post("/getLatLong_test", function (req , res){
    lat = req.body.lat;
    longi = req.body.longi;
//res.send("lat"+lat +" long-"+longi)
      // MongoClient.connect(url, function (err, db)
      //      {
      //        medicine_shop = db.collection('medicine_shop');
      //        medicine_shop.createIndex( { loc : "2dsphere" } );
      //         medicine_shop.find( { loc:
      //                          { $near :
      //                            { $geometry :
      //                               { type : "Point" ,
      //                                 coordinates : [ longi , lat ] } ,
      //                              $maxDistance : 100000
      //                       } } } ).toArray(function (err , list){
                               
      //                             res.json({user:list});
      //                       });

      //       });

 MongoClient.connect(url, function (err, db) {
     test =  db.createCollection('test_lab');

    test_lab = db.collection('test_lab');
    test_lab.createIndex( { loc : "2dsphere" } );

   test_lab.find( { loc:
                         { $near :
                           { $geometry :
                              { type : "Point" ,
                                coordinates : [longi , lat] } ,
                             $maxDistance : 4000
                      } } } ).toArray(function (err , list){
                          console.log(list);
                            res.send(list);
                      });    
                    });
  });
  
//****************************************************************Get Latitutde And Longitude for Procedure********************************************

app.post("/getLatLong_procedure", function (req , res){
try{
    lat = req.body.lat;
    longi = req.body.longi;
	
	/* res.send("lat"+lat +" long-"+longi)
       MongoClient.connect(url, function (err, db)
            {
              medicine_shop = db.collection('medicine_shop');
              medicine_shop.createIndex( { loc : "2dsphere" } );
               medicine_shop.find( { loc:
                                { $near :
                                  { $geometry :
                                     { type : "Point" ,
                                       coordinates : [ longi , lat ] } ,
                                    $maxDistance : 100000
                             } } } ).toArray(function (err , list){
                               
                                   res.json({user:list});
                             });

             }); */

 MongoClient.connect(url, function (err, db) {
     procedure =  db.createCollection('procedure_hospital');

    procedure_hospital = db.collection('procedure_hospital');
    procedure_hospital.createIndex( { loc : "2dsphere" } );

   procedure_hospital.find( { loc:
                         { $near :
                           { $geometry :
                              { type : "Point" ,
                                coordinates : [longi , lat] } ,
                             $maxDistance : 4000
                      } } } ).toArray(function (err , list){
                          console.log(list);
                            res.send(list);
                      });    
                    });
 } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
  });
  
////****************************************************************ADD & GET MEDICINE HERE**********************************************************************


app.post('/add_medicine', function(req , res) 
{
  try{
  console.log("working"+req.body.medicine_name);
  MongoClient.connect(url, function (err, db)
     {
         //  db.createCollection("medicine", function(err, collection){
         // if (err) throw err;

         //  console.log("Created medicine");
         //  console.log(collection);
         //  });
      medicine =  db.collection('medicine');

      req.body.create_on = date;
      req.body.status = 1;

	  
      medicine.insert(req.body);

      res.send("Medicine added successfully .");
      //   , function (err, result){
      //     if (err) {
      //   console.log(err);
      // } else {

      // }
      // });

      });
  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});


app.get('/get_medicine', function(req , res)
{
  try{
  MongoClient.connect(url, function (err, db)
     {
       db.collection('medicine').find().toArray(function (err, result ){
        if(err){ 
          console.log(err)
        }else{
          res.json(result);
        }
      });

     });
  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
});


////****************************************************************ADD & GET PROCEDURE HERE**********************************************************************


app.post('/add_procedure', function(req , res) 
{
  try{
  console.log("working"+req.body.procedure_name);
  MongoClient.connect(url, function (err, db)
     {
          /* db.createCollection("procedure", function(err, collection){
          if (err) throw err;

          console.log("Created procedure");
          console.log(collection);
          }); */
      procedure =  db.collection('procedure');

      req.body.create_on = date;
      req.body.status = 1;
   procedure.insert(req.body);
   res.send("Procedure added successfully.");
      //   , function (err, result){
      //     if (err) {
      //   console.log(err);
      // } else {

      // }
      // });

      });
  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});



app.get("/get_procedure", function (req , res)
{try{
   MongoClient.connect(url, function (err, db) {
     s =  db.collection('procedure');
      s.find().toArray(function (err , procedurelist){
                res.json({user:procedurelist});
              });
          });
   } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});


////****************************************************************ADD & GET TEST HERE**********************************************************************


app.post('/add_test', function(req , res) 
{
  try{
  console.log("working"+req.body.test_name);
  MongoClient.connect(url, function (err, db)
     {
         /*  db.createCollection("test", function(err, collection){
         if (err) throw err;

          console.log("Created test");
          console.log(collection);
          }); */
      test =  db.collection('test');

      req.body.create_on = date;
      req.body.status = 1;

	  
      test.insert(req.body);

      res.send("Test added successfully.");
        /* , function (err, result){
          if (err) {
        console.log(err);
      } else {

      }
      }); */

      });
  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});

app.get("/get_test", function (req , res)
{ try{
   MongoClient.connect(url, function (err, db) {
     s =  db.collection('test');
      s.find().toArray(function (err , testlist){
                res.json({user:testlist});
              });
          });
   } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});


////////////////////////////---MEDICINE SEARCH START HERE------/////////////////////

app.post('/search' , function (req , res )
{ 
  try{
     // console.log("working"+req.body.medicine_name);
       MongoClient.connect(url, function (err, db)
     {
       // db.createCollection("search_log", function (err, collection){
       //   if (err) throw err;

       //    console.log("search_log");
       //    console.log(collection);
       //    });
       search_log =  db.collection('search_log');
      req.body.create_on = date;
      search_log.insert(req.body);

     med_name = req.body.search_parm;

      med =   db.collection('medicine');
            //var regexValue='\.*'+med_name+'\.';
            med.find({"medicine_name":new RegExp(med_name)}).toArray(function(err, items) {
                res.json({user:items});
            });


     });
       } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
});

///***************************************************************************GET MEDICINE NAME (ON SEARCH)***************************************************************************

app.post('/get_medicine_name' , function (req , res )
{
  // console.log(req.body.search_parm);
  // res.send(req.body.search_parm+"parm get");
     // console.log("working"+req.body.medicine_name);
try{
           med_name = req.body.search_parm;
   if(med_name)
   {

        MongoClient.connect(url, function (err, db)
      {
     //   db.createCollection("search_log", function (err, collection){
     //     if (err) throw err;

     //      console.log("search_log");
     //      console.log(collection);
     //      });
       


       med =   db.collection('medicine');
     //        //var regexValue='\.*'+med_name+'\.'; '^'+med_name, 'i'
            med.find({"medicine_name":new RegExp('^'+med_name, 'i')}).toArray(function(err, items) {
               res.json(items);
               console.log({user:items});
           });

      });

  }else{ res.send("[]");}
  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});


//***************************************************************************GET TEST NAME (ON SEARCH)***************************************************************************


app.post('/get_test_name' , function (req , res)
{
  // console.log(req.body.search_parm);
  // res.send(req.body.search_parm+"parm get");
     // console.log("working"+req.body.medicine_name);
try{
           test_name = req.body.search_parm_test;
   if(test_name)
   {

        MongoClient.connect(url, function (err, db)
      {
     //   db.createCollection("search_log", function (err, collection){
     //     if (err) throw err;

     //      console.log("search_log");
     //      console.log(collection);
     //      });
       


       test =   db.collection('test');
     //        //var regexValue='\.*'+test_name+'\.'; '^'+test_name, 'i'
            test.find({"testName":new RegExp('^'+test_name, 'i')}).toArray(function(err, items) {
               res.json(items);
               console.log({user:items});
           });

      });

  }else{ res.send("[]");}
  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});



///**********************************************************GET PROCEDURE NAME (ON SEARCH)**********************************************

app.post('/get_procedure_name' , function (req , res )
{
  // console.log(req.body.search_parm);
  // res.send(req.body.search_parm+"parm get");
     // console.log("working"+req.body.medicine_name);
try{
           proc_name = req.body.search_parm_procedure;
   if(proc_name)
   {

        MongoClient.connect(url, function (err, db)
      {
     //   db.createCollection("search_log", function (err, collection){
     //     if (err) throw err;

     //      console.log("search_log");
     //      console.log(collection);
     //      }); 
       


       proc =   db.collection('procedure');
     //        //var regexValue='\.*'+proc_name+'\.'; '^'+proc_name, 'i'
            proc.find({"procedureName":new RegExp('^'+proc_name, 'i')}).toArray(function(err, items) {
               res.json(items);
               console.log({user:items});
           });

      });

  }else{ res.send("[]");}
  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});


/* ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

																SEARCH ALL ITEMS(MEDICINE,TEST,PROCEDURE)		
_____________________________________________________________________________________________________________________________________________________________________________________-- */

app.post('/get_all_items_on_search' , function (req , res )
{
  // console.log(req.body.search_parm);
  // res.send(req.body.search_parm+"parm get");
     // console.log("working"+req.body.medicine_name);
try{
           items_name = req.body.search_parm_all_items;
		   
   if(items_name)
   {

        MongoClient.connect(url, function (err, db)
      {
     //   db.createCollection("search_log", function (err, collection){
     //     if (err) throw err;

     //      console.log("search_log");
     //      console.log(collection);
     //      });
       
     var items;
	   var medData,testData,procData;
	   
	
			med =   db.collection('medicine');
            // var regexValue='\.*'+proc_name+'\.'; '^'+proc_name, 'i'
            med.find({"medicine_name":new RegExp('^'+items_name, 'i')}).toArray(function(err, items) {
           
				medData = items;
			
			
				test =   db.collection('test');
				// var regexValue='\.*'+proc_name+'\.'; '^'+proc_name, 'i'
				test.find({"testName":new RegExp('^'+items_name, 'i')}).toArray(function(err, items) {
				 
				testData = items;
				 
				
	
					proc =   db.collection('procedure');
					 //var regexValue='\.*'+proc_name+'\.'; '^'+proc_name, 'i'
					proc.find({"procedureName":new RegExp('^'+items_name, 'i')}).toArray(function(err, items) {
					
					procData = items;
					
					
				console.log({med:medData, test:testData,proc:procData});
				res.json({med:medData, test:testData,proc:procData});
						
						
			
					});
				});
           });
      });
 
  }else{ res.send("[]");}

  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});



////////--------------------------------------------------Search For Medicine Shop---------------------------------------------------------

app.post('/search_medicine_shop' , function (req , res)
        {
          try{
           medicine_shop = req.body.medicine_shop;
          MongoClient.connect(url, function (err, db) {

              med_shop =  db.collection('medicine_shop');
              med_shop.find({"shopname":new RegExp('^'+medicine_shop, 'i')}).toArray(function (err , shoplist){
                res.json(shoplist);
              });
          });
          } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
        });

//------------------------*************************************Search for Test Lab*************************************---------------

app.post('/search_test_lab' , function (req , res)
        {
          try{
           test_lab = req.body.test_lab;
          MongoClient.connect(url, function (err, db) {

              tst_lab =  db.collection('test_lab');
              tst_lab.find({"labname":new RegExp('^'+test_lab, 'i')}).toArray(function (err , lablist){
                res.json(lablist);
              });
          }); 
              } catch (err) {
        // handle the error safely
                  res.send({msg:"no data found"});  
          } 
        });
//------------------------*************************************Search for Procedure HOSPITAL************************************************************************************---------------

		
		app.post('/search_procedure_hospital' , function (req , res)
        {
          try{
           procedure_hospital = req.body.procedure_hospital;
          MongoClient.connect(url, function (err, db) {

              proc_hospital =  db.collection('procedure_hospital');
              proc_hospital.find({"hospitalname":new RegExp('^'+procedure_hospital, 'i')}).toArray(function (err , hospitallist){
                res.json(hospitallist);
              });
          });  
        } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

        });
		
		

app.get('/search_log', function(req , res)
{
try{
  MongoClient.connect(url, function (err, db)
     {
       db.collection('search_log').find().toArray(function (err, result ){
        if(err){ 
          console.log(err)
        }else{
          res.json(result);
        }
      });

     });
  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
// res.sendFile(__dirname + '/public/medicine.html');
  //req.render('medicine.html');

});


// res.sendFile(__dirname + '/public/medicine.html');
  //req.render('medicine.html');



app.post('/search' , function (req , res )
{
  try{
   console.log(req.body.search_parm);
  // res.send(req.body.search_parm+"parm get");
     // console.log("working"+req.body.medicine_name);
        MongoClient.connect(url, function (err, db)
      {
     //   db.createCollection("search_log", function (err, collection){
     //     if (err) throw err;

     //      console.log("search_log");
     //      console.log(collection);
     //      });
       search_log =  db.collection('search_log');
      req.body.create_on = date;
      search_log.insert(req.body);

      med_name = req.body.search_parm;

       med =   db.collection('medicine');
     //        //var regexValue='\.*'+med_name+'\.'; '^'+med_name, 'i'
            med.find({"medicine_name":new RegExp('^'+med_name, 'i')}).toArray(function(err, items) {
               res.json(items);
           });





     });

        } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
});

app.post('/search_medicine' , function (req , res){
try{
   med_name = req.body.search;
   console.log(med_name);
   MongoClient.connect(url, function (err, db)
     {
         med =   db.collection('medicine');
           // var regexValue='\.*'+med_name+'*\.'; 
            med.find({"medicine_name":new RegExp('^'+med_name, 'i')}).toArray(function(err, items) {
              console.log(items);
                 res.json({user:items});
            });
    });
   } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
});

// app.get('/search_medicine/:med', function (req, res){
//   med_name =req.params.med;
//   console.log(med_name);
//   MongoClient.connect(url, function (err, db)
//      {

//             med =   db.collection('medicine');
//            // var regexValue='\.*'+med_name+'*\.'; 
//             med.find({"medicine_name":new RegExp('^'+med_name, 'i')}).toArray(function(err, items) {
//               console.log(items);
//                 res.json(items);
//             });

//      });

// });

app.get('/edit_medicine/:id', function (req, res){
try{
  id =req.params.id;

   MongoClient.connect(url, function (err, db)
     {
      med =   db.collection('medicine');

      var o_id = new mongodb.ObjectID(id);
      med.findOne({_id:o_id} , function (err , doc){
      if(err){ 
          console.log(err)
        }else{
                console.log(doc);

      res.json(doc);
          }

            });
     });

  console.log(id);
  } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

});

app.put('/medicine/:id', function (req, res)
      {
        try{
        id =  req.params.id;
          MongoClient.connect(url, function (err, db)
           {
                    var o_id = new mongodb.ObjectID(id);
                    console.log(o_id);
                    db.collection('medicine').update({_id:o_id}, {$set: {medicine_name:req.body.medicine_name ,
                    med_desc:req.body.med_desc ,
                    company: req.body.company ,
                    salt_name:req.body.salt_name ,
                    potency: req.body.potency ,
                    tablet: req.body.tablet 
                    }});

   //                  med.updateOne(
   //    { _id : o_id },
   //    {
   //      $set: { "medicine_name": req.body.medicine_name },
   //    }, function(err, results) {
   //    console.log(results);
   //    callback();
   // });

            //   med.findAndModify({query: {_id:o_id },
            //   update:{$set: {medicine_name:req.body.medicine_name , med_desc:req.body.med_desc }},
            //   new:true}, function (err, doc)
            //                       {
            //                         res.json(doc);
            //                       }
            // );
           });
res.send("abccccc");

        console.log(req.body.medicine_name+""+req.body.med_desc);
        } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }

      });

app.get('/remove_medicine/:id', function (req , res){
 try{
     id =  req.params.id;
     MongoClient.connect(url, function (err, db)
           {
            var o_id = new mongodb.ObjectID(id);
            //db.collection('medicine').update({_id:o_id}, {$set: {status:0} });

            med = db.collection('medicine');
            med.remove({_id: new mongodb.ObjectID(id)});
          });
     res.send(id);
     } catch (err) {
    // handle the error safely
              res.send({msg:"no data found"});  
      }
});


///-----------Medicine end script -------------//


app.post('/contactlist', function(req, res){
		console.log(req.body);
	MongoClient.connect(url, function (err, db) {

		var collection = db.collection('users');

	collection.insert(req.body, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
      }

	});
})
});

app.post('/createRole', function(req,res){
  MongoClient.connect(url, function (err, db) {
  //     db.createCollection("user_role", function(err, collection){
  //    if (err) throw err;

  //     console.log("Created testCollection");
  //     console.log(collection);
  // });


        var user_role = db.collection('user_role');

        user_role.insert(req.body, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
      }

  });



});
});


// app.get('/rolelist', function(req, res){

//     MongoClient.connect(url, function (err, db)
//      {
//         var rolelist =  db.collection('user_role');
//         rolelist.find().toArray(function(err, result)
//         {
//             res.json(result);
//         });
//      }

// });

//   }

/// ------------------get ROLE List ---------//////
app.get('/rolelist', function(req, res){

  MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    var role = db.collection('user_role');

    role.find().toArray(function (err, result) {
      // if (err) {
      //   console.log(err);
      // } else if (result.length) {
        console.log('Found:', result);
         res.json(result);
      // } else {
      //   console.log('No document(s) found with defined "find" criteria!');
      // }

    
    db.close();
    });
  }
});

console.log("http running on port 300");

});

////////////---------- Role List end Script ---------////////////



app.get('/contactlist', function(req, res){

	MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    var collection = db.collection('users');

    collection.find().toArray(function (err, result) {
      // if (err) {
      //   console.log(err);
      // } else if (result.length) {
        console.log('Found:', result);
         res.json(result);
      // } else {
      //   console.log('No document(s) found with defined "find" criteria!');
      // }

    
    db.close();
    });
  }
});

console.log("http running on port 300");

});

app.get('/user_edit/:id',function (res ,req){


MongoClient.connect(url, function (err, db) {
       if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
          id =res.params.id;

  var collection = db.collection('users');
    collection.findone({_id:id}, function(err, doc){

      res.json(doc);

  });
  }

  });

    console.log(id);

});

app.listen(3000);

console.log("server running on port 300");