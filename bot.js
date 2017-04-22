var config = require('./config.json');
var currentSong, newSong;

const http = require("http");
const LastFmNode = require('lastfm').LastFmNode;

const Discord = require("discord.js");
const client = new Discord.Client();

var lastfm = new LastFmNode({
  api_key: config.api_key
});

var trackStream = lastfm.stream(config.username);

trackStream.on('nowPlaying', function(track) {
    newSong = track.artist["#text"] + ' - ' + track.name;
    if (newSong != currentSong) {
        console.info('currently playing:', newSong);
        client.user.setGame(newSong);
        currentSong = newSong;
    }
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
    trackStream.start();
});

client.login(config.token);