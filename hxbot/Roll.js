var Random = require('random-js'),
     config = require('../config.json');

var RollModule = function () {
    this.random = new Random;
};

RollModule.prototype.Message = function(message)
{
    var keyword = 'roll';
    var rollIndex = message.content.indexOf(keyword);
    var sideCount = parseInt(message.content.substring(rollIndex + keyword.length).trim().replace(/\s/g, '+'));

    if(sideCount>0)
    {
        var engine = Random.engines.mt19937().autoSeed();
        try {
            var res = Random.die(sideCount)(engine);
            message.reply(`you rolled a ${res}`);
        } catch(error) {
            message.reply('error: Something went wrong. You probably picked a too high number.');
        };
    }else{
        message.reply(`error. Please provide a number >0, like \`${config.commandPrefix}roll 6\``);
    }

}

module.exports = RollModule;
