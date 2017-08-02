var config  = require('../config.json'),
    JsonDB  = require('node-json-db'),
    fs      = require('fs');

var db = new JsonDB('database', true, true);

var DbHelper = function () {};

DbHelper.prototype.Init = function()
{
    console.log('Initiating database.');
    // It's two items so I'm just gonna do it like this. Fight me.
    this.UpdateOld('lastfm_users');
    this.Populate('lastfm_users',1);
    this.UpdateOld('used_jokes');
    this.Populate('used_jokes',0);
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

// For backwards compatibility:
DbHelper.prototype.UpdateOld = function(database){
    try {
        var oldDb = require(`../${database}.json`);
    } catch(e) {
        // No old DB found, we don't have to do anything.
    }
    if(oldDb)
    {
        console.log(`Detected outdated DB file '${database}.json'. Updating.`);
        Object.keys(oldDb).forEach( function(e, i) {
            db.push('/'+database,oldDb[e]);
            console.log(`Imported ${oldDb[e].length} items from '${database}.json'`);
        });
        fs.unlinkSync(`./${database}.json`);
        console.log(`'${database}.json' deleted.`);
    }
};

module.exports = DbHelper;
