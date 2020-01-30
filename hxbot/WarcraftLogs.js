var request = require('request'),
    JsonDB = require('node-json-db'),
    config = require('../config.json')

var db = new JsonDB('database', true, true);

var WarcraftLogs = function () {};

WarcraftLogs.prototype.Message = function(message)
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

    var action = msgArr[1];
    var aIndex = message.content.indexOf(action);

    switch (action) {
        case 'set':
            if (msgArr.length < 5) {
                message.reply(`You sent too few parameters. I must know the gamemode (retail/classic), the region (eu,us,asia,oce), the realm name and the guild name.`)
                return false;
            }
            var zone = msgArr[4] + '/' + msgArr[3] + "|" + msgArr[2];
            var guildName = msgArr[5];
            for (var i = 6; i <= msgArr.length -1; i++) {
                guildName += " " + msgArr[i];
            }
            guildId = guildName + '/' + zone;
            getLatestLog(guildId, true);
            //db.push(`/warcraftlogs/guilds/${id}`, result);
            break;
        default:
            var guild = db.getData('/warcraftlogs/guilds/' + id);
            if (guild) {
                message.channel.send(getLatestLog(guild));
                message.delete();
            }
            break;
    }

    function getLatestLog(guildId, test = false)
    {

        var zone = guildId.split('|')[1];
        var guild = guildId.split('|')[0];

        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'https://github.com/HxxxxxS/DiscordBot'
        }

        var options = {
            url: 'https://' + (zone == 'classic' ? 'classic.' : '') + 'warcraftlogs.com/v1/reports/guild/' + guild + '?api_key=' + config.warcraft_logs.apikey,
            port: 443,
            method: 'GET',
            headers: headers
        }

        const convertMilliseconds = (miliseconds, format) =>
        {
            let days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

            total_seconds = parseInt(Math.floor(miliseconds / 1000));
            total_minutes = parseInt(Math.floor(total_seconds / 60));
            total_hours = parseInt(Math.floor(total_minutes / 60));
            days = parseInt(Math.floor(total_hours / 24));

            seconds = parseInt(total_seconds % 60);
            minutes = parseInt(total_minutes % 60);
            hours = parseInt(total_hours % 24);

            switch(format) {
                case 's':
                    return seconds;
                case 'm':
                    return minutes;
                case 'h':
                    return hours;
                case 'd':
                    return days;
                default:
                    return { d: days, h: hours, m: minutes, s: seconds };
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                if (!test) {
                    var latest = data[0];
                    var seconds = convertMilliseconds(latest.end - latest.start, 's');
                    var minutes = convertMilliseconds(latest.end - latest.start, 'm');
                    var hours = convertMilliseconds(latest.end - latest.start, 'h');
                    var days = convertMilliseconds(latest.end - latest.start, 'd');
                    var time = `${days}d ${hours}h ${minutes}m ${seconds}s`;

                    var link = 'https://' + (zone == 'classic' ? 'classic.' : '') + 'warcraftlogs.com/reports/' + latest.id;

                    message.channel.send(`Latest log: **${latest.title}**\nDuration: **${time}**\n${link}`);
                }
                /*var joke = JSON.parse(body);
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
                }*/
            }else{
                console.log((error?error:response));
                message.channel.send(`WarcraftLogs returned an error: ${response.statusCode}`);
            }
        });
    }
}

module.exports = WarcraftLogs;
