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
    var questionmarkIndex = message.content.lastIndexOf('?');

    var question = `**${message.author.username} polled:**\n`;
    question += message.content.substring(pollIndex + keyword.length,questionmarkIndex+1).trim();
    var options = message.content.substring(questionmarkIndex+1).trim().split(' ').map(s => s.replace(/[<>]/g, ''));

    if(question.length > 0 && options.length > 0)
    {
        message.channel.send(question).then(function (poll) {
            for (var i = 0; i < options.length; i++) {
                poll.react(options[i]);
            }
        });
    }
}

module.exports = PollModule;
