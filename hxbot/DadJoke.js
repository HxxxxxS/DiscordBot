var request = require('request');

var DadJokeModule = function () {};

DadJokeModule.prototype.Message = function(message)
{

    var request = require('request');

    var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'https://github.com/HxxxxxS/DiscordBot'
    }

    var options = {
        url: 'https://icanhazdadjoke.com',
        port: 443,
        method: 'GET',
        headers: headers
    }

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            message.reply(JSON.parse(body).joke);
        }else{
            console.log(error);
            message.reply(`something went wrong. https://icanhazdadjoke.com/ returned HTTP status code: ${response.statusCode}`);
        }
    })

}

module.exports = DadJokeModule;
