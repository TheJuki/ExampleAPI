/*
 * routes/count.js
 * 
 * Count API
*/

// MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');

// String Formatter
const f = require('util').format;

// Assert
const assert = require('assert');

// JWT
const { expressjwt: jwt } = require("express-jwt");

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
  app.get("/api/v1/count/json", jwt({secret: jwtSecret, audience: jwtAudience, issuer: jwtIssurer, algorithms: ["HS256"]}), function (req, res) {
    if(isOffline === "true")
    {
      return res.json({ "Offline": true });
    }
    
    const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    client.connect(err => {
      const collection = client.db(process.env.DB).collection("counts");
      // perform actions on the collection object
      collection.find().toArray(function(err, docs) {
        assert.equal(err, null);
        res.json(docs[0]);
        client.close();
      });
    });
  });
}
