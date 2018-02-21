/*
 * routes/count.js
 * 
 * Count API
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

module.exports = function(app, dbUrl) {
  
  /*
    Gets the count entries for charts
  */
  app.get("/api/v1/count/json", jwt({secret: jwtSecret, audience: jwtAudience, issuer: jwtIssurer}), function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    mongodb.MongoClient.connect(dbUrl, function(err, client) {
      assert.equal(null, err);
      console.log("Connected to server");

      const db = client.db(process.env.DB);

      const counts = db.collection('counts');

      counts.find().toArray(function(err, docs) {
        assert.equal(err, null);
        res.json(docs[0]);
        client.close();
      });
    });
  });
}
