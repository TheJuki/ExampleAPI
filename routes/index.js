/*
 * routes/index.js
 * 
 * Requires the routes in the routes folder
*/

var fs = require('fs');

module.exports = function(app, dbUrl) {
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file === "index.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js')
            return;
        var name = file.substr(0, file.indexOf('.'));
        require('./' + name)(app, dbUrl);
    });
}