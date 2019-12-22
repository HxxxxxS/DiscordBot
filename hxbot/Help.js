var config = require('../config.json');

var HelpModule = function () {
    this.commands = config.commands;
};

HelpModule.prototype.Message = function(message)
{
    var msg = "\n```Commands: \n";
    msg += "-------------------------------------\n";
    for (var i = 0; i < this.commands.length; i++) {
        msg += config.commandPrefix+this.commands[i].cmd + ": " + this.commands[i].desc + "\n";
        if(this.commands[i].syntax)
        {
            msg += " "+"Example: "+config.commandPrefix+this.commands[i].syntax+"\n";
        }
        msg += "-------------------------------------\n";
    }
    msg += "```";
    msg += '*The code for this bot is freely available at https://github.com/HxxxxxS/DiscordBot*';
    message.reply(msg);
}

module.exports = HelpModule;
