/*
 * team.js
 * 
 * Team API
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

const teamMapper = require('../map/team');

module.exports = function(app) {
  
  /*
    Gets a list of Teams
  */
  app.get("/api/v1/team/list/json", jwt({secret: jwtSecret, audience: jwtAudience, issuer: jwtIssurer}), function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    var sv = req.query.term;
    mongodb.MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);
      console.log("Connected to server");

      const db = client.db(process.env.DB);

      const teams = db.collection('teams');

      teams.find().map(x => teamMapper.mapTeamToListItemJson(x)).toArray(function(err, docs) {
        assert.equal(err, null);
        res.json(docs);
        client.close();
      });
    });
  });
}