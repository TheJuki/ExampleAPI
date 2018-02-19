/*
 * routes/contact.js
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

// JWT
const jwt = require('express-jwt');

// Is Offline?
const isOffline = process.env.ISOFFLINE;

// JWT components
const jwtSecret = process.env.JWT_SECRET;
const jwtAudience = process.env.JWT_AUDIENCE;
const jwtIssurer = process.env.JWT_ISSURER;

const contactMapper = require('../map/contact');

module.exports = function(app, dbUrl) {
  
  /*
    Gets a list of Contacts by full name search
  */
  app.get("/api/v1/contact/list/json", jwt({secret: jwtSecret, audience: jwtAudience, issuer: jwtIssurer}), function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    var sv = req.query.term;
    mongodb.MongoClient.connect(dbUrl, function(err, client) {
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
  });

  /*
    Gets a list of Lookup Contacts by full name search
  */
  app.get("/api/v1/contact/lookup/json", jwt({secret: jwtSecret, audience: jwtAudience, issuer: jwtIssurer}), function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    var sv = req.query.term;
     mongodb.MongoClient.connect(dbUrl, function(err, client) {
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
  });

  /*
    Saves a Contact
  */
  app.post("/api/v1/contact/save", jwt({secret: jwtSecret, audience: jwtAudience, issuer: jwtIssurer}), function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    var contact = req.body;
    mongodb.MongoClient.connect(dbUrl, function(err, client) {
      assert.equal(null, err);
      console.log("Connected to server");

      const db = client.db(process.env.DB);

      const contacts = db.collection('contacts');
      
      contact.modifiedDate = new Date();

      if(contact.id == null || contact.id.trim().length < 1)
      {
        contact.creatingUser = contact.modifyingUser;
        contact.createdDate = contact.modifiedDate;
        
        contacts.insertOne(contactMapper.mapContactJsonToContact(contact), function(err, result) {
          client.close();
          if(err)
          {
            console.log(err);
            res.json({ "Success": false, "error": "Contact could not be added" });
          }
          else
          {
             console.log('Inserted Contact', result.insertedId, 'at', contact.modifiedDate);
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
             console.log('Updated Contact', contact.id, 'at', contact.modifiedDate);
             res.json({ "Success": true, "id": contact.id });
          }
        });
      }

    });
  });

  /*
    Gets a Contact by _id
  */
  app.get("/api/v1/contact/find/json", jwt({secret: jwtSecret, audience: jwtAudience, issuer: jwtIssurer}), function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    var id = req.query.id;
    mongodb.MongoClient.connect(dbUrl, function(err, client) {
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
  });
}