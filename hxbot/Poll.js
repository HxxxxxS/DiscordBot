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

    var ret = `**${message.member.displayName} asked:**\n`;
    var options = message.content.trim().match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g);
    var question = message.content.substring(pollIndex + keyword.length).trim();

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
