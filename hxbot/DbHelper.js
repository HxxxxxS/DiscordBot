var config  = require('../config.json'),
    JsonDB  = require('node-json-db'),
    fs      = require('fs');

var db = new JsonDB('database', true, true);

var DbHelper = function () {};

DbHelper.prototype.Init = function()
{
    console.log('Initiating database.');
    var s = this;
    ['lastfm_users','used_jokes'].forEach( function(e) {
        s.UpdateOld(e);
    });

    db.reload();
}

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
