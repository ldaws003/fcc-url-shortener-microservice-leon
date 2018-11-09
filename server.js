'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var bodyParser = require('body-parser');
process.env.MONGOLAB_URI="mongodb://ldaws003:Captaincommando5@ds155313.mlab.com:55313/urlshortenerleon";

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

var Schema = mongoose.Schema;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//Creating the shortUrlSchema
var shortUrlSchema = new Schema ({
  original_url: String,
  short_url: Number  
});

//creating the shortUrl model

var shortUrl = mongoose.model('shortUrl', shortUrlSchema);

//this function saves to the database the person object + assigns the short_url and returns the JSON
//turns out that the shortUrl.find runs last possibly due to loading
/*shortUrl.deleteMany({}, function(err) {if (err) throw err});
shortUrl.find({}, function(error, data){
    if (error) throw error;
    console.log(data);
  });*///deletes everything be careful


app.post("/api/shorturl/new", function(req, res){

  var url = req.body.url;
  var urlTestRegex = /^https{0,1}:\/\/www\.\w+\.com(\/\w+)*$/;
  var pass = false;
  var originalUrl = url.match(/www\.\w+\.com/)[0];
  
  //check if url is in the correct format
  if(!urlTestRegex.test(url)){
    res.json({"error":"invalid URL"});
    pass = true;   
  }
  
  //check if url actually exists  
  dns.lookup(originalUrl, function(error, address){
     if(error){ 
       res.json({"error":"invalid URL"});
       pass = true;
     }
    
     //if pass is true then this code block is ignored
       
       if(!pass){
         shortUrl.findOne({original_url: originalUrl}, function(error, data){
           if (error) throw error;
           if(data == null){
             // check the length of the database then save the data then do the json response
             shortUrl.find({}, function(error, data){
               if (error) throw error;
               var short_url_value = data.length + 1;
               var urlJson = {original_url: originalUrl, short_url: short_url_value};
               var shortUrljson = new shortUrl(urlJson);
               shortUrljson.save((error) => {
                 if (error) throw error;
                 res.json(urlJson);
               });
             });  
           } else {
             var extractedJson = {original_url: data.original_url, short_url: data.short_url};
             res.json(extractedJson)           
           }
         });
       }
     });
});

//this will redirect the user to another site
app.get(/\/api\/shorturl\/\d+/, function(req, res){
  
  var lookupUrl = Number(req.originalUrl.replace("/api/shorturl/", ""));
  shortUrl.findOne({short_url: lookupUrl}, function(error, data){
    if (error) throw error;
    if(data != null){
      res.redirect('http://' + data.original_url);     
    } else {
      res.json({Hello: "World"});
    }
  });   
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});