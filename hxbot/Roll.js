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
            var n = Random.die(sideCount)(engine);
            if(message.guild && message.guild.id == '340324466221514763')
            {
                if(n%10 == parseInt(n/10)%10){
                    message.reply(`you rolled a <:checkem:342834590865686530> ${n}. Checkem!`);
                }else{
                        switch(n){
                            case 420:
                                message.reply(`you rolled a <:weed:341315349058289664> <:420:341290982534283264> <:weed:341315349058289664>`);
                                break;
                            case 69:
                                message.reply(`you rolled a <:yaranaika:341315361666367488> 69.`);
                                break;
                            default:
                                message.reply(`you rolled a ${n}.`);
                        }
                }
            }else{
                message.reply(`you rolled a ${n}.`);
            }
        } catch(error) {
            message.reply('error: Something went wrong. You probably picked a too high number.');
        };
    }else{
        message.reply(`error. Please provide a number >0, like \`${config.commandPrefix}roll 6\`.`);
    }

}

module.exports = RollModule;
