var JsonDB = require('node-json-db');

var db = new JsonDB('database', true, true);

var GuildVote = function () {
};

GuildVote.prototype.Init = function()
{
    var votes = db.getData('/GuildVotes');

    console.log(votes);
}

const emoji = [
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
    'regional_indicator_a', 'regional_indicator_b', 'regional_indicator_c', 'regional_indicator_d', 
    'regional_indicator_e', 'regional_indicator_f', 'regional_indicator_g', 'regional_indicator_h', 
    'regional_indicator_i', 'regional_indicator_j', 'regional_indicator_k', 'regional_indicator_l', 
    'regional_indicator_m', 'regional_indicator_n', 'regional_indicator_o', 'regional_indicator_p', 
    'regional_indicator_q', 'regional_indicator_r', 'regional_indicator_s', 'regional_indicator_t', 
    'regional_indicator_u', 'regional_indicator_w', 'regional_indicator_x', 'regional_indicator_y', 
    'regional_indicator_z', 
]

GuildVote.prototype.Message = function(message)
{
    if(message.deletable)
    {
        message.delete();
    }

    var keyWord = 'guildvote';
    var keyIndex = message.content.indexOf(keyWord);

    var parameters = message.content.substr(keyIndex + keyWord.length).trim().split(' ');

    console.log(parameters);

    var instructions = `\nTo add a suggestion to this vote, type \`!guildvote nominate YOUR SUGGESTION HERE\``;
    const emojis = message.client.emojis.cache;

    if (parameters[0] == '!new') {
        parameters.shift();
        message.channel.send(parameters.join(' ')+instructions)
        .then(sent=>{
            console.log(sent.channel.id, message.author.id);
            db.push('/GuildVotes/'+sent.channel.id, {message: sent.id, description: parameters.join(' '), suggestions: []})
        });
    } else if (parameters[0] == 'nominate') {
        parameters.shift();
        try {
            var vote = db.getData('/GuildVotes/'+message.channel.id);
            console.log(vote);
            let emoji = emojis.random();
            vote.suggestions.push({emoji:emoji, suggestion: parameters.join(" ")});
            db.push('/GuildVotes/'+message.channel.id, vote);
            message.channel.messages.fetch(vote.message)
            .then(sent => {
                let ret = ""
                for (var i = vote.suggestions.length - 1; i >= 0; i--) {
                    ret += `${vote.suggestions[i].emoji} - ${vote.suggestions[i].suggestion} \n`
                    sent.react(vote.suggestions[i].emoji);
                }
                sent.edit(vote.description+'\n \n'+ret+instructions);
            })
            .catch(e=>{
                db.delete('/GuildVotes/'+message.channel.id);
                console.error(e);
            })
        } catch(e) {
            console.error(e);
        }
    }
}

module.exports = GuildVote;
