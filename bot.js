var config = require("./config.json");
var currentSong, newSong, currentAlbum;

const http = require("http");
const LastFmNode = require("lastfm").LastFmNode;

const Discord = require("discord.js");
const client = new Discord.Client();

var lastfm = new LastFmNode({
    api_key: config.api_key
});

function stoppedPlaying(){
    console.log("stopped playing.");
    client.user.setGame(0);
    currentAlbum = 0;
    if(config.changeAvatar){
        client.user.setAvatar(config.defaultAvatar);
    }
}

var trackStream = lastfm.stream(config.username);

trackStream.on("nowPlaying", function(track) {
    if(track.name && track.artist["#text"]){
        //console.log(track);
        if(track["@attr"]){
            newSong = track.artist["#text"] + " - " + track.name;
            if (newSong != currentSong) {
                if (currentAlbum != track.album["#text"]){
                    if(track.image[0]["#text"] && config.changeAvatar){
                        console.log("playing album: "+track.album["#text"]);
                        client.user.setAvatar(track.image[track.image.length-1]["#text"]);
                        currentAlbum = track.album["#text"];
                    }
                }
                console.info("currently playing:", newSong);
                client.user.setGame("♫ "+newSong);
                currentSong = newSong;
            }
        }else{
            stoppedPlaying();
        }
    }
});

trackStream.on("stoppedPlaying", function(track) {
    stoppedPlaying();
});

trackStream.on("error", function(err) {
    console.log("something went wrong: ",err);
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.username}!`);
    trackStream.start();
});

// Script for exiting the process is from https://frankl.in/code/before-exit-scripts-in-node-js

let preExit = [];

// Add pre-exit script
preExit.push(code => {
    console.log('Whoa! Exit code %d, cleaning up...', code);
    stoppedPlaying();
});

// Catch CTRL+C
process.on('SIGINT', () => {
  console.log('\nCTRL+C...');
  stoppedPlaying();
  process.exit(0);
});

// Catch uncaught exception
process.on('uncaughtException', err => {
  console.dir(err, {
    depth: null
  });
  stoppedPlaying();
  process.exit(1);
});

console.log('Bot on, hit CTRL+C to exit :)');
client.login(config.token);
