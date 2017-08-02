var  config = require('../config.json'),
     LastfmAPI = require('lastfmapi'),
     JsonDB = require('node-json-db');

var db = new JsonDB('database', true, true);

var LastfmModule = function () {
    this.lfm = new LastfmAPI({
        'api_key' : config.lastfm.apikey,
        'secret' : config.lastfm.apisecret
    });
};

LastfmModule.prototype.Message = function(message)
{
    var keyword = "set_lastfm";
    var nickIndex = message.content.indexOf(keyword);
    var nick = message.content.substring(nickIndex + keyword.length).trim().replace(/\s/g, "+");

    if (nickIndex > -1 && nick.length > 1) {
        this.lfm.user.getInfo(nick,
            function(err,info){
                if(err)
                {
                    message.reply(`last.fm error: ${err.message}`);
                }
                if(info)
                {
                    message.reply(`gotcha! your last.fm account is ${info.url}`);
                    console.log(`${message.author.id} is last.fm user "${info.name}"`);
                    db.push(`/lastfm_users/${message.author.id}`, info.name);
                }
            }
        );
    }
}

module.exports = LastfmModule;
