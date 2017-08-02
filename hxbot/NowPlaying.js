var config = require('../config.json'),
    LastfmAPI = require('lastfmapi'),
    JsonDB = require('node-json-db');

var db = new JsonDB('database', true, true);

var NowPlayingModule = function () {
    this.lfm = new LastfmAPI({
        'api_key' : config.lastfm.apikey,
        'secret' : config.lastfm.apisecret
    });
};

NowPlayingModule.prototype.Message = function(message)
{
    db.reload();
    var users = db.getData(`/lastfm_users`);
    if(Object.keys(users).indexOf(message.author.id)>-1)
    {
        this.lfm.user.getRecentTracks({user:users[message.author.id]}, function(err, recentTracks){
            if(err)
            {
                message.reply(`last.fm error: ${err.message}`);
            }
            if(recentTracks)
            {
                var track = recentTracks.track[0];
                if(track['@attr'])
                {
                    message.channel.send(`${message.author} is currently listening to ♫ ${track.artist["#text"]} - ${track.name}`);
                }else{
                    message.channel.send(`${message.author} last listened to ♫ ${track.artist["#text"]} - ${track.name} ♫`);
                }
            }
        });
    }else{
        message.reply(`you have not set your last.fm account yet.\nUse \`${config.commandPrefix}set_lastfm nick\` to set it.`);
    };
}

module.exports = NowPlayingModule;
