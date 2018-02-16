/*
 * server.js
 * 
 * API for Example app
*/

// init project

// Express
var express = require('express');

// MongoDB
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectId;

// Init Express with Body Parser
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Support for HTML files
app.use(express.static('public'));

// String Formatter
const f = require('util').format;

// Assert
const assert = require('assert');

// Password Hasher
var bcrypt = require('bcrypt');
const saltRounds = 10;

// JWT
var jwt = require('jsonwebtoken');

// DB credentials
const user = encodeURIComponent(process.env.USER);
const password = encodeURIComponent(process.env.PASS);

// JWT components
const jwtSecret = process.env.JWT_SECRET;
const jwtAudience = process.env.JWT_AUDIENCE;
const jwtIssurer = process.env.JWT_ISSURER;

// DB URL
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

// API login
app.post("/api/v1/login", function (req, res) {
  var user = req.body.userId.toLowerCase();
  var password = req.body.password;
  console.log('LOGIN ' + user);
  
  mongodb.MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected to server");

    var db = client.db(process.env.DB);
    
    var users = db.collection('users');
    
    db.collection("users").findOne({ userId : { $eq: user } }, function(err, userDoc) {
      
      if(err || !userDoc)
      {
         client.close();
         res.json({"success": false })
      }
      else
      {
      
        bcrypt.compare(password, userDoc.password, function(err, result) {
          if(result == true)
          {
            jwt.sign({sub: userDoc.userId}, jwtSecret, { expiresIn: '24h', audience: jwtAudience, issuer : jwtIssurer }, function(err, token) {
              if(err)
              {
                  client.close();
                  console.log(err);
                  res.json({"Success": false })
              }
              else
              {
                
                db.collection("contacts").findOne({ _id : { $eq: new ObjectId(userDoc.contactId) } }, function(err, contactDoc) {
                  if(err || !contactDoc)
                  {
                   client.close();
                   res.json({"success": false })
                  }
                  else
                  {
                     client.close();
                     res.json(
                       {
                         "Success": true, 
                         "token": token, 
                         "id": userDoc.id, 
                         "fullName": contactDoc.firstName + " " + contactDoc.lastName, 
                         "username": userDoc.userId, 
                         "roles": userDoc.roles.split(",") 
                       });
                  }
                });
               
              }
            });
            
          }
          else
          {
            client.close();
            res.json({"Success": false })
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