/*
 * server.js
 * 
 * API for Example app
*/

// init project
var express = require('express');
var mongodb = require('mongodb');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const f = require('util').format;
const assert = require('assert');
app.use(express.static('public'));

var bcrypt = require('bcrypt');
const saltRounds = 10;

const user = encodeURIComponent(process.env.USER);
const password = encodeURIComponent(process.env.PASS);

// Connection URL
const url = f('mongodb://%s:%s@%s:%s/?authSource=%s',
  user, password, process.env.HOST, process.env.PORT, process.env.DB);

// Generates a new password hash
app.get("/updateUserPassword", function (req, res) {
  bcrypt.hash("kotlin", saltRounds, function(err, hash) {
    mongodb.MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);
      console.log("Connected to server");

      var db = client.db(process.env.DB);
      var users = db.collection('users');

      users.update(
        { userId: 'user' }, 
        { $set: { password: hash } },
        function (err, result) {
            if(err)
            {
              res.send("Password hash FAILED");
            }
            else
            {
              res.send("Password hash updated");
            }
        });
      client.close();
    });
  });
});

app.get("/", function (request, response) {
  response.send("<h1>Welcome!</h1>");
});

app.get("/api/v1/contact/list/json", function (req, res) {
  var sv = req.query.sv;
  var type = req.query.type;
  res.json({"sv": sv, "type": type})
});

app.post("/api/v1/login", function (req, res) {
  var user = req.body.user;
  var password = req.body.password;
  console.log('LOGIN ' + user + ' ' + password);
  
  mongodb.MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected to server");

    var db = client.db(process.env.DB);
    
    var users = db.collection('users');
    
    db.collection("users").findOne({ userId : { $eq: user } }, function(err, userDoc) {
      client.close();
      
      if(err || !userDoc)
      {
         res.json({"success": false })
      }
      else
      {
        console.log(userDoc.userId);
      
        bcrypt.compare(password, userDoc.password, function(err, result) {
          if(result == true)
          {
            console.log("Password matches!")
            res.json({"success": true })
          }
          else
          {
            console.log("Password fail!")
            res.json({"success": false })
          }
        });
      }
    });
  });
});

// listen for requests :)
var listener = app.listen("3000", function () {
  console.log('Your app is listening on port ' + listener.address().port);
});