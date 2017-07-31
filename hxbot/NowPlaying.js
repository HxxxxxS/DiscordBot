var config = require('../config.json'),
     LastfmAPI = require('lastfmapi'),
     JsonDB = require('node-json-db');

var db = new JsonDB('lastfm_users', true, false);

var NowPlayingModule = function () {
    this.lfm = new LastfmAPI({
        'api_key' : config.lastfm.apikey,
        'secret' : config.lastfm.apisecret
    });
};

NowPlayingModule.prototype.Message = function(message)
{
    db.reload();
    try {
        var nick = db.getData(`/lastfm_users/${message.author.id}`);
    } catch(error) {
        message.reply(`you have not set your last.fm account yet.\nUse \`${config.commandPrefix}set_lastfm nick\` to set it.`);
    };
    if(nick)
    {
        this.lfm.user.getRecentTracks({user:nick}, function(err, recentTracks){
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
    }
}

module.exports = NowPlayingModule;
