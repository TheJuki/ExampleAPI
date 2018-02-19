/*
 * contact.js
 * 
 * Contact API
*/

// MongoDB
const mongodb = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

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

// DB URL
const url = f('mongodb://%s:%s@%s:%s/?authSource=%s',
  user, password, process.env.HOST, process.env.PORT, process.env.DB);

const contactMapper = require('../map/contact');

module.exports = function(app) {
  
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

            contacts.find({"fullName": {'$regex': sv, '$options': 'i'}}).map(x => contactMapper.mapContactToTableCellJson(x)).toArray(function(err, docs) {
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

            contacts.find({"fullName": {'$regex': sv, '$options': 'i'}}).map(x => contactMapper.mapContactToContactLookupJson(x)).toArray(function(err, docs) {
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

            if(contact.id == null || contact.id.trim().length < 1)
            {
              contacts.insertOne(contactMapper.mapContactJsonToContact(contact), function(err, result) {
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
              contacts.updateOne({ "_id" : new ObjectId(contact.id) },{ $set: contactMapper.mapContactJsonToContact(contact) }, function(err, result) {
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
              res.json(contactMapper.mapContactToContactJson(contactDoc));
              client.close();
            });

          });
        }
      });
    }
  });
}