var config = require('../config.json');

var ClearModule = function () {
    this.commands = config.commands;
};

ClearModule.prototype.Message = function(message)
{
    if (!message.deletable)
    {
        message.reply(`I'm not allowed to delete messages in this channel.`)
        return false;
    }
    if (!message.member.hasPermission('MANAGE_MESSAGES'))
    {
        message.reply(`You're not allowed to delete messages in this channel.`)
        return false;
    }

    let amount = 100;
    const msgArr = message.content.split(' ');
    if (msgArr.length > 1) amount = parseInt(msgArr[1]);
    amount = Math.min(amount+2,100)
    message.reply(`You are about to delete the ${amount} latest messages from #${message.channel.name}.\nTo confirm, react to this message with any emoji within 30s. This message will self destruct in 30 seconds.`)
    .then(msg => {
        const filter = (reaction, user) => user.id == message.author.id
        msg.awaitReactions(filter, {time: 30000, max: 1, errors: ['time']})
        .then(collected => {
            msg.edit('If you say so...');
            message.channel.bulkDelete(amount, true);
        })
        .catch(collected => {
            msg.edit(':boom: SELF DESTRUCTING!! THIS MESSAGE IS EXPLODE :boom: ')
            if (message.deletable) message.delete();
            if (!collected.count) msg.delete();
        });
    });
}

module.exports = ClearModule;
