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
var path = require('path');

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

/*
  Generates a new password hash for testing
*/
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

/*
  Welcome!
*/
app.get("/", function (req, res) {
  res.sendFile("index.html");
});

/*
  Login page for testing
*/
app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/login.html"));
});

/*
  JWT Token verification page for testing
*/
app.get("/verify", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/verify.html"));
});

/*
  Verifies a JWT Token for testing
*/
app.post("/verify", function (req, res) {
  jwt.verify(req.body.token, jwtSecret, { audience: jwtAudience, issuer: jwtIssurer }, function(err, decoded) {
    if(err)
    {
       res.json({"Success": false });
    }
    else
    {
       res.json({"Success": true });
    }
  });
 });

/*
  Gets a list of Contacts by full name search
*/
app.get("/api/v1/contact/list/json", function (req, res) {
  var sv = req.query.sv;
  if (!req.headers.authorization) {
    res.status(403).json({ "Success": false, error: 'No auth sent!' });
  }
  else
  {
    jwt.verify(req.headers.authorization, jwtSecret, { audience: jwtAudience, issuer: jwtIssurer }, function(err, decoded) {
      if(err)
      {
         res.json({ "Success": false });
      }
      else
      {
        mongodb.MongoClient.connect(url, function(err, client) {
          assert.equal(null, err);
          console.log("Connected to server");

          var db = client.db(process.env.DB);

          const contacts = db.collection('contacts');
          
          contacts.find({"fullName": {'$regex': sv, '$options': 'i'}}).map(x => mapContactToTableCellJson(x)).toArray(function(err, docs) {
            assert.equal(err, null);
            res.json(docs);
            client.close();
          });
          
        });
      }
    });
  }
});

/*
  Gets a Contact by _id
*/
app.get("/api/v1/contact/find/json", function (req, res) {
  var id = req.query.id;
  console.log(id);
  if (!req.headers.authorization) {
    res.status(403).json({ "Success": false, error: 'No auth sent!' });
  }
  else
  {
    jwt.verify(req.headers.authorization, jwtSecret, { audience: jwtAudience, issuer: jwtIssurer }, function(err, decoded) {
      if(err)
      {
         res.json({ "Success": false });
      }
      else
      {
        mongodb.MongoClient.connect(url, function(err, client) {
          assert.equal(null, err);
          console.log("Connected to server");

          var db = client.db(process.env.DB);

          const contacts = db.collection('contacts');
          
          db.collection("contacts").findOne({ _id : { $eq: new ObjectId(id) } }, function(err, contactDoc) {
            if(err || !contactDoc)
            {
             client.close();
             res.json({ "Success": false });
            }
            res.json(mapContactToContactJson(contactDoc));
            client.close();
          });
          
        });
      }
    });
  }
});

/*
  Maps a Contact to TableCellJson
*/
function mapContactToTableCellJson(c)
{
    return {
      "id": String(c._id),
      "status": "Contact",
      "date": c.emailAddress,
      "account": c.teamName,
      "category": c.businessPhone,
      "contact": c.fullName,
    }
}

/*
  Maps a Contact to ContactJson
*/
function mapContactToContactJson(c)
{
    return {
      "id": String(c._id),
      "firstName": c.firstName,
      "lastName": c.lastName,
      "mobilePhone": c.mobilePhone,
      "emailAddress": c.emailAddress,
      "businessPhone": c.businessPhone,
      "supervisorName": c.supervisorName,
      "supervisorId": c.supervisorId,
      "modifyingUser": c.modifyingUser,
      "creatingUser": c.creatingUser,
      "createdDate": c.createdDate,
      "modifiedDate": c.modifiedDate,
      "teamId": c.teamId,
      "teamName": c.teamName,
    }
}

/*
  API login
*/
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
         res.json({ "Success": false });
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
                  res.json({ "Success": false });
              }
              else
              {
                
                db.collection("contacts").findOne({ _id : { $eq: new ObjectId(userDoc.contactId) } }, function(err, contactDoc) {
                  if(err || !contactDoc)
                  {
                   client.close();
                   res.json({ "Success": false });
                  }
                  else
                  {
                     client.close();
                     res.json(
                       {
                         "Success": true, 
                         "token": token, 
                         "id": contactDoc._id, 
                         "fullName": contactDoc.fullName, 
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
            res.json({ "Success": false });
          }
        });
      }
    });
  });
});

// listen for requests
var listener = app.listen("3000", function () {
  console.log('Your app is listening on port ' + listener.address().port);
});