var PollModule = function () {
};

PollModule.prototype.Message = function(message)
{
    if(message.deletable)
    {
        message.delete();
    }
    var keyword = 'poll';
    var pollIndex = message.content.indexOf(keyword);
    var optionIndex = message.content.replace(/[<>\W]+/g, ' ').length;

    var ret = `**${message.author.username} asked:**\n`;
    var options = message.content.substring(optionIndex).trim().split(' ').map(s => s.replace(/[<>]/g, ''));

    var question = message.content.substring(pollIndex + keyword.length, optionIndex).trim();

    ret += question;

    if(question.length > 0 && options.length > 0)
    {
        message.channel.send(ret).then(function (poll) {
            for (var i = 0; i < options.length; i++) {
                poll.react(options[i]);
            }
        });
    }
}

module.exports = PollModule;
