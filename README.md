# HxBot
Another Discord bot made for another Discord server.

### Features
- Greet/Part messages when people join/leave your server
- Customizable commandPrefix, `!` by default.
- !help command to list available commands

#### Screenshots
![!help command](https://i.imgur.com/h7WyseI.png)
![urban dictionary](https://i.imgur.com/q3QUZOr.png)
![polls](https://i.imgur.com/I203fZr.png)
![last.fm functionality](https://i.imgur.com/5fAjAAW.png)
![jokes](https://i.imgur.com/RaWCW98.png)

Hilarious, I know..

### Installation
1. `npm install`
2. Rename `config.json.example` to `config.json` and fill in your credentials. If you have more than one bot in your server, make sure the commandPrefix is set to something unique.
  - Get your Discord token here: https://discordapp.com/developers/applications/me
  - Get your Last.fm api keys here: https://www.last.fm/api/account/create
3. Use `node index.js` to run, or set up something like https://github.com/foreverjs/forever (`forever start -a index.js`)

This code is distributed under the [MIT License](LICENSE). Feel free to use, copy, modify, or redestribute the code. If you come up with a kick ass feature, feel free to submit a [PR](https://github.com/HxxxxxS/DiscordBot/pulls), or at least tell me about it! You can reach me on Discord as `hx#0012`.

*Based loosely on https://github.com/Cleanse/InsomBot*

*Forked from https://github.com/HxxxxxS/DiscordLastfmBot/ which in turn is a fork of https://github.com/wsmigielski/DiscordSpotifyBot*
