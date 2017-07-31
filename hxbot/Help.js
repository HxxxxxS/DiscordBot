var config = require('../config.json');

var HelpModule = function () {
    this.commands = config.commands;
};

HelpModule.prototype.Message = function(message)
{
    var msg = "\n```Commands: \n";
    msg += "-------------------------------------\n";
    for (var i = this.commands.length - 1; i >= 0; i--) {
        msg += config.commandPrefix+this.commands[i].cmd + ": " + this.commands[i].desc + "\n";
        if(this.commands[i].syntax)
        {
            msg += " "+"Example: "+config.commandPrefix+this.commands[i].syntax+"\n";
        }
        msg += "-------------------------------------\n";
    }
    msg += "```";
    message.reply(msg);
}

module.exports = HelpModule;
