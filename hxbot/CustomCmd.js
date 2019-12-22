var CustomCmd = function () {};

var  config = require('../config.json'),
     JsonDB = require('node-json-db');

var db = new JsonDB('database', true, true);


CustomCmd.prototype.Message = function(message)
{

    switch (message.channel.type) {
        case 'text':
            var id = message.guild.id;
            break;
        case 'dm':
        case 'group':
            var id = message.channel.id;
            break;
    }

    if (!id) return false;

    var msgArr = message.content.split(" ");

    var action = msgArr[0].substring(1);

    var cmd = msgArr[1];
    var cmdIndex = message.content.indexOf(cmd);

    var result = message.content.substring(cmdIndex + cmd.length).trim();

    if (cmd != '') {

        switch (action) {
            case 'set':
                db.push(`/cmds/${id}/${cmd}`, result);
                message.reply(`Added new command **${config.commandPrefix+cmd}**`);
                break;
            case 'remove':
                db.delete(`/cmds/${id}/${cmd}`);
                message.reply(`Deleted command **${config.commandPrefix+cmd}**`);
                break;
            default:
                return false;
        }

    }
}

module.exports = CustomCmd;
