/*
 * routes/note.js
 * 
 * Note API
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

const noteMapper = require('../map/note');

module.exports = function(app, dbUrl) {
  
  /*
    Gets a list of Notes by parent id and type
  */
  app.get("/api/v1/note/list/json", jwt({secret: jwtSecret, audience: jwtAudience, issuer: jwtIssurer}), function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    const pId = req.query.pId;
    const pType = req.query.pType;
    const type = req.query.type;
    mongodb.MongoClient.connect(dbUrl, function(err, client) {
      assert.equal(null, err);
      console.log("Connected to server");

      const db = client.db(process.env.DB);

      const notes = db.collection('notes');
      
      let query = {"parentId": pId, "parentType": pType};
      
      if(type != 'All')
      {
         query = {"parentId": pId, "parentType": pType, "type": type};
      }

      notes.find(query).map(x => noteMapper.mapNoteToTableCellJson(x)).toArray(function(err, docs) {
        assert.equal(err, null);
        res.json(docs);
        client.close();
      });
    });
  });

  /*
    Saves a Note
  */
  app.post("/api/v1/note/save", jwt({secret: jwtSecret, audience: jwtAudience, issuer: jwtIssurer}), function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    const note = req.body;
    mongodb.MongoClient.connect(dbUrl, function(err, client) {
      assert.equal(null, err);
      console.log("Connected to server");

      const db = client.db(process.env.DB);

      const notes = db.collection('notes');
      
      note.modifiedDate = new Date();

      if(note.id == null || note.id.trim().length < 1)
      {
        note.creatingUser = note.modifyingUser;
        note.createdDate = note.modifiedDate;
        
        notes.insertOne(noteMapper.mapNoteJsonToNote(note), function(err, result) {
          client.close();
          if(err)
          {
            console.log(err);
            res.json({ "Success": false, "error": "Note could not be added" });
          }
          else
          {
             console.log('Inserted Note', result.insertedId, 'at', note.modifiedDate);
             res.json({ "Success": false, "id": result.insertedId });
          }
        });
      }
      else
      {
        notes.updateOne({ "_id" : new ObjectId(note.id) },{ $set: noteMapper.mapNoteJsonToNote(note) }, function(err, result) {
          client.close();
          if(err)
          {
            console.log(err);
            res.json({ "Success": false , "error": "Note could not be updated" });
          }
          else
          {
             console.log('Updated Note', note.id, 'at', note.modifiedDate);
             res.json({ "Success": true, "id": note.id });
          }
        });
      }

    });
  });

  /*
    Gets a Note by _id
  */
  app.get("/api/v1/note/find/json", jwt({secret: jwtSecret, audience: jwtAudience, issuer: jwtIssurer}), function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    const id = req.query.id;
    mongodb.MongoClient.connect(dbUrl, function(err, client) {
      assert.equal(null, err);
      console.log("Connected to server");

      const db = client.db(process.env.DB);

      const notes = db.collection('notes');

      db.collection("notes").findOne({ _id : { $eq: new ObjectId(id) } }, function(err, noteDoc) {
        if(err || !noteDoc)
        {
         client.close();
         console.log('Note not found for id', id);
         res.json({ "Success": false, "error": "Note not found"  });
        }
        console.log('Note found for id', id);
        res.json(noteMapper.mapNoteToNoteJson(noteDoc));
        client.close();
      });
    });
  });
}