[![Stories in Ready](https://badge.waffle.io/HxxxxxS/DiscordLastfmBot.png?label=ready&title=Ready)](https://waffle.io/HxxxxxS/DiscordLastfmBot)
# Discord Last.fm Bot
Updates the game you are playing to the current song playing on your Last.fm Account.  
Just a simple bot I made for fun using https://discord.js.org/#/ and https://www.npmjs.com/package/lastfm  
Forked from https://github.com/wsmigielski/DiscordSpotifyBot
## How to install
To install and run this bot you will need the nodejs installed https://nodejs.org/en/  
You will have to download the DiscordLastfmBot v1.36 folder https://github.com/HxxxxxS/DiscordLastfmBot/archive/v1.36.zip  
Unzip the file.  

Next you will need to find you client token.  
To do this press `Ctrl + Shift + I` while on your discord app.  
Then proceed to find the token and copy it.  
![How to find the token](https://cloud.githubusercontent.com/assets/9850907/23435366/401bf38e-fdff-11e6-872c-127119a2a3d1.png)  
Put the token in the config file "" where it says user token.  

Now you need your last.fm api key and username.  
Create an api account at http://www.last.fm/api  
Copy the api key to the config file. Insert your username.  

Lastly, insert the url to your default discord avatar. Host it on imgur or something idk.  

## Running the script
Firstly you want to run the install.bat file to install all the required dependencies.  
...or run `npm install` in your terminal of choice.  

Then just run the run.bat or `node bot.js` whenever you want to run the bot.  
To exit the bot just use CTRL-C in the Command Prompt where the process is running.  

### Known Issues
Bot crashing when streamer mode is on within discord.  
The bot will not show you as playing the current song on last.fm on your own discord client, however other people will see it. You also need to clear all your custom set games till the point where it is saying no game detected.  
![From official discord.js discord channel](https://i.imgur.com/VSu1JEd.png)