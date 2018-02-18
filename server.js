/*
 * server.js
 * 
 * API for Example app
*/

// init project
const websiteTitle = 'Example API';

// Express
const express = require('express');

// MongoDB
const mongodb = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

// Content Filter
var filter = require('content-filter');

// Init Express with Body Parser and Content Filter
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '1mb'})); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' })); // support encoded bodies

// Use Pug view engine
app.set('view engine', 'pug');

/* Filter Options */
const blackList = process.env.BLACKLIST.split(",");
const filterOptions = {
	typeList:['object','string'],
	urlBlackList: blackList,
  bodyBlackList: blackList,
	dispatchToErrorHandler: true,
	appendFound: true
}

/* Applying the filter */
app.use(filter(filterOptions));

// Support for HTML files
app.use(express.static('public'));
const path = require('path');

// String Formatter
const f = require('util').format;

// Assert
const assert = require('assert');

// Password Hasher
const bcrypt = require('bcrypt');
const saltRounds = 10;

// JWT
const jwt = require('jsonwebtoken');

// Is Offline?
const isOffline = process.env.ISOFFLINE;

// DB credentials
const user = encodeURIComponent(process.env.USER);
const password = encodeURIComponent(process.env.PASS);

// JWT components
const jwtSecret = process.env.JWT_SECRET;
const jwtAudience = process.env.JWT_AUDIENCE;
const jwtIssurer = process.env.JWT_ISSURER;

// App Credentials
const appUser = process.env.APP_USER;
const appPassword = process.env.APP_PASSWORD;

// DB URL
const url = f('mongodb://%s:%s@%s:%s/?authSource=%s',
  user, password, process.env.HOST, process.env.PORT, process.env.DB);

/*
  Generates a new password hash for testing
*/
app.get("/updateUserPassword", function (req, res) {
  if(isOffline)
  {
    return res.json({ "Offline": true });
  }
  bcrypt.hash(appPassword, saltRounds, function(err, hash) {
    mongodb.MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);
      console.log("Connected to server");

      const db = client.db(process.env.DB);
      const users = db.collection('users');

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
  if(isOffline === "true")
  {
    return res.json({ "Offline": true });
  }
  //res.sendFile(path.join(__dirname + "/public/home.html"));
  res.render('home', { title: websiteTitle, nav: 'home', server: req.protocol + 's://' + req.get('host'), user: appUser, password: appPassword });
});

/*
  Login page for testing
*/
app.get("/login", function (req, res) {
  if(isOffline === "true")
  {
    return res.json({ "Offline": true });
  }
  //res.sendFile(path.join(__dirname + "/public/login.html"));
  res.render('login', { title: websiteTitle, nav: 'login' });
});

/*
  JWT Token verification page for testing
*/
app.get("/verify", function (req, res) {
  if(isOffline === "true")
  {
    return res.json({ "Offline": true });
  }
  //res.sendFile(path.join(__dirname + "/public/verify.html"));
  res.render('verify', { title: websiteTitle, nav: 'verify' });
});

/*
  Verifies a JWT Token for testing
*/
app.post("/api/v1/verify", function (req, res) {
  if(isOffline === "true")
  {
    return res.json({ "Offline": true });
  }
  jwt.verify(req.body.token, jwtSecret, { audience: jwtAudience, issuer: jwtIssurer }, function(err, decoded) {
    if(err)
    {
       console.log(err);
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
  if(isOffline === "true")
  {
    return res.json({ "Offline": true });
  }
  var sv = req.query.term;
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

          const db = client.db(process.env.DB);

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
  Gets a list of Lookup Contacts by full name search
*/
app.get("/api/v1/contact/lookup/json", function (req, res) {
  if(isOffline === "true")
  {
    return res.json({ "Offline": true });
  }
  var sv = req.query.term;
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

          const db = client.db(process.env.DB);

          const contacts = db.collection('contacts');
          
          contacts.find({"fullName": {'$regex': sv, '$options': 'i'}}).map(x => mapContactToContactLookupJson(x)).toArray(function(err, docs) {
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
  Saves a Contact
*/
app.post("/api/v1/contact/save", function (req, res) {
  if(isOffline === "true")
  {
    return res.json({ "Offline": true });
  }
  var contact = req.body;
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
          console.log(new Date());

          const db = client.db(process.env.DB);

          const contacts = db.collection('contacts');
          
          if(contact.id.trim().length < 1)
          {
            contacts.insertOne(mapContactJsonToContact(contact), function(err, result) {
              client.close();
              if(err)
              {
                console.log(err);
                res.json({ "Success": false, "error": "Contact could not be added" });
              }
              else
              {
                 console.log('inserted record', result.insertedId);
                 res.json({ "Success": false, "id": result.insertedId });
              }
            });
          }
          else
          {
            contacts.updateOne({ "_id" : new ObjectId(contact.id) },{ $set: mapContactJsonToContact(contact) }, function(err, result) {
              client.close();
              if(err)
              {
                console.log(err);
                res.json({ "Success": false , "error": "Contact could not be updated" });
              }
              else
              {
                 res.json({ "Success": true, "id": contact.id });
              }
            });
          }
          
        });
      }
    });
  }
});

/*
  Gets a Contact by _id
*/
app.get("/api/v1/contact/find/json", function (req, res) {
  if(isOffline === "true")
  {
    return res.json({ "Offline": true });
  }
  var id = req.query.id;
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
             res.json({ "Success": false, "error": "Contact not found"  });
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
  API login
*/
app.post("/api/v1/login", function (req, res) {
  if(isOffline === "true")
  {
    return res.json({ "Offline": true });
  }
  const user = req.body.userId.toLowerCase();
  const password = req.body.password;
  console.log('LOGIN ' + user);
  
  mongodb.MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected to server");

    const db = client.db(process.env.DB);
    
    const users = db.collection('users');
    
    db.collection("users").findOne({ userId : { $eq: user } }, function(err, userDoc) {
      
      if(err || !userDoc)
      {
         client.close();
         res.json({ "Success": false, "error": "Username or password is incorrect" });
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
                  res.json({ "Success": false, "error": "JWT FAIL!"  });
              }
              else
              {
                
                db.collection("contacts").findOne({ _id : { $eq: new ObjectId(userDoc.contactId) } }, function(err, contactDoc) {
                  if(err || !contactDoc)
                  {
                   client.close();
                   res.json({ "Success": false, "error": "Contact not found for this user"  });
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
            res.json({ "Success": false, "error": "Username or password is incorrect"  });
          }
        });
      }
    });
  });
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
  Maps a Contact to ContactLookupJson
*/
function mapContactToContactLookupJson(c)
{
    return {
      "id": String(c._id),
      "value": c.fullName,
      "label": c.fullName + " (" + c.teamName + ")",
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
  Maps a ContactJson to Contact
*/
function mapContactJsonToContact(c)
{
    return {
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

/* Error Handling */
app.use(function (req, res, next) {
  if(isOffline === "true")
  {
    return res.json({ "Offline": true });
  }
  res.status(404).json({ "Success": false, "error": "Page/API Not Found" });
})

app.use(function (err, req, res, next){
	console.log("A new error has fallen to the error handler")
	console.log("Status: ", err.status);
	console.log("Code: ", err.code);
	console.log("Message: ", err.message);
	res.status(err.status).json({ "Success": false, "error": "Something went wrong." });
});

// listen for requests
const listener = app.listen("3000", function () {
  console.log('Your app is listening on port ' + listener.address().port);
});