var JsonDB          = require('node-json-db');

var DbHelper        = require('./DbHelper.js'),
    Help            = require('./Help.js'),
    Urban           = require('./Urban.js'),
    Lastfm          = require('./Lastfm.js'),
    NowPlaying      = require('./NowPlaying.js'),
    Poll            = require('./Poll.js'),
    Roll            = require('./Roll.js'),
    DadJoke         = require('./DadJoke.js'),
    OnyxiaReset     = require('./OnyxiaReset.js'),
    CustomCmd       = require('./CustomCmd.js'),
    WarcraftLogs    = require('./WarcraftLogs.js');

var HxBot = function() {
    this.config     = require('../config.json');
    this.DbHelper   = new DbHelper;
    this.Help       = new Help;
    this.Urban      = new Urban;
    this.Lastfm     = new Lastfm;
    this.NowPlaying = new NowPlaying;
    this.Poll       = new Poll;
    this.Roll       = new Roll;
    this.DadJoke    = new DadJoke;
    this.OnyxiaReset= new OnyxiaReset;
    this.CustomCmd  = new CustomCmd;
    this.Logs       = new WarcraftLogs;
}

HxBot.prototype.guildMemberAdd = function (member) {
    let guild = member.guild;
    //guild.defaultChannel.sendMessage(`${member.user} joined ${member.guild} :ok_hand: Welcome!`).catch(console.error);
}

HxBot.prototype.guildMemberRemove = function(member) {
    let guild = member.guild;
    //guild.defaultChannel.sendMessage(`${member.user} left ${member.guild} :cry:`).catch(console.error);
};

HxBot.prototype.getCommand  = function(message,callback)
{
    if (typeof this.config.commands !== 'undefined' && this.config.commands.length > 0){
        if(message.content.substring(0,1) != this.config.commandPrefix){
            return false;
        }
        for(var i = 0; i != this.config.commands.length; i++) {
            var command = this.config.commands[i];
            if (message.content.substring(1,command.cmd.length+1) == command.cmd) {
                return command.callback;
                break;
            }
        }
        return false;
    }else{
        console.log('Error reading commands from config.json');
        return false;
    }
}

HxBot.prototype.runCommand = function(message, command, callback)
{
    if (command != 0) {
        this[command].Message(command, message, callback);
    }
}

HxBot.prototype.checkMessageForEasterEggs = function(message)
{
    var easterEggs = [
        {
            pattern:/^a+yy+$/i,
            response: 'lmao'
        },
        {
            pattern: /^g+oo+n+\!*$/i,
            response: 'SQUA'+'A'.repeat(message.content.length-4)+'D'
        },
        {
            pattern: /i+['´`]?m+ g+a+y+/i,
            response: `${message.author.username} has officially come out of the closet! Rejoice!`
        }
    ];
    for (var i = easterEggs.length - 1; i >= 0; i--) {
        var regex = new RegExp(easterEggs[i].pattern);
        if(regex.test(message.content))
        {
            message.channel.send(easterEggs[i].response);
        }
    }
    // Debug command to check ping
    if(message.content == this.config.commandPrefix+'ping')
    {
        message.channel.send('pong..').then(sent => {
            sent.edit(`Ping is **${sent.createdTimestamp - message.createdTimestamp}ms**`);
        });
    } else {
        if (message.content[0] == this.config.commandPrefix) {
            var db = new JsonDB('database', true, true);
            var cmd = message.content.substring(1).trim();
            switch (message.channel.type) {
                case 'text':
                    var id = message.guild.id;
                    break;
                case 'dm':
                case 'group':
                    var id = message.channel.id;
                    break;
            }
            try {
                var res = db.getData(`/cmds/${id}/${cmd}`);
                message.channel.send(res);
            } catch(e) {
                console.log(`/cmds/${id}/${cmd} - Invalid command..`);
            }
        }
    }
}

module.exports = HxBot;
