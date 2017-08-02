var request = require('request'),
    JsonDB = require('node-json-db');

var db = new JsonDB('database', true, true);

var DadJokeModule = function () {};

DadJokeModule.prototype.Message = function(message)
{

    var jokes = db.getData('/used_jokes');

    (function theThing()
    {

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
                var joke = JSON.parse(body);
                if(jokes.indexOf(joke.id) > -1)
                {
                    console.log(`we've already told joke ${joke.id}! rerolling`);
                    theThing();
                }else{
                    message.reply(joke.joke);
                    db.push('/used_jokes[]',joke.id);
                    if(jokes.length>50)
                    {
                        db.delete('/used_jokes[0]');
                    }
                }
            }else{
                console.log((error?error:response));
                message.reply(`something went wrong. https://icanhazdadjoke.com/ returned HTTP status code: ${response.statusCode}`);
            }
        });
    }());
}

module.exports = DadJokeModule;
