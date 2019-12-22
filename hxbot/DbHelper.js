var config  = require('../config.json'),
    JsonDB  = require('node-json-db'),
    fs      = require('fs');

var DbHelper = function () {};

var db = new JsonDB('database', true, true);

DbHelper.prototype.Init = function()
{
    console.log('Initiating database.');
    this.Populate('lastfm_users',1);
    this.Populate('used_jokes',0);
    this.Populate('cmds',1);
    db.reload();
}

// I need to initiate the array/objects or node-json-db throws errors.
DbHelper.prototype.Populate = function(database,type){ // type 1 for object, 0 for array
    try {
        var data = db.getData('/'+database);
    } catch(e) {
        // statements
        db.push('/'+database,(type?{}:[]));
    }
};

module.exports = DbHelper;
