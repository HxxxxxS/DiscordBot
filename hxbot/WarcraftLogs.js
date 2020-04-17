var request = require('request'),
    JsonDB = require('node-json-db'),
    config = require('../config.json');

var db = new JsonDB('database', true, true);

var WarcraftLogs = function () {};

var raids = {
    1000: 'Molten Core',
    1001: 'Onyxia\'s Lair',
    1002: 'Blackwing Lair',
    1003: 'Zul\'Gurub'
}

WarcraftLogs.prototype.Message = function(message)
{
    const convertMilliseconds = (miliseconds) =>
    {
        let days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

        total_seconds = parseInt(Math.floor(miliseconds / 1000));
        total_minutes = parseInt(Math.floor(total_seconds / 60));
        total_hours = parseInt(Math.floor(total_minutes / 60));
        days = parseInt(Math.floor(total_hours / 24));

        seconds = parseInt(total_seconds % 60);
        minutes = parseInt(total_minutes % 60);
        hours = parseInt(total_hours % 24);

        var ret = '';

        if (days) ret += (days > 9 ? days : '0'+days)+':';
        if (hours) ret += (hours > 9 ? hours : '0'+hours)+':';
        ret += (minutes > 9 ? minutes : '0'+minutes)+':';
        ret += (seconds > 9 ? seconds : '0'+seconds);

        return ret;
    };

    const getLatestLog = (guildId) =>
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

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                var latest = data[0];
                getLog(latest.id, zone);
            }else{
                console.log((error?error:response));
                message.channel.send(`WarcraftLogs returned an error: ${response.statusCode}`);
            }
        });
    }

    const getLog = (code, zone) =>
    {
        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'https://github.com/HxxxxxS/DiscordBot'
        }

        var options = {
            url: 'https://' + (zone == 'classic' ? 'classic.' : '') + 'warcraftlogs.com/v1/report/fights/' + code + '?api_key=' + config.warcraft_logs.apikey,
            port: 443,
            method: 'GET',
            headers: headers
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                sendTheThing(code, zone, data);
            }else{
                console.log((error?error:response));
                message.channel.send(`WarcraftLogs returned an error: ${response.statusCode}`);
            }
        });
    }

    const sendTheThing = (code, zone, data) =>
    {
        var link = 'https://' + (zone == 'classic' ? 'classic.' : '') + 'warcraftlogs.com/reports/' + code;

        var fields = [{
            name: '\u200b',
            value:  'Zone: **' + raids[data.zone] + "**\n" +
                    'Date: **' + new Date(data.start).toDateString() + "**\n" +
                    'Duration: **' + convertMilliseconds(data.end - data.start) + "**\n"
        },{name:'\u200b',value:'Bosses:'}];

        var bosses = [];

        for (var i = 0; i<data.fights.length; i++)
        {
            var fight = data.fights[i];

            if (fight.boss)
            {
                if (bosses.indexOf(fight.name)>-1) continue;
                bosses.push(fight.name);
                var enemy;
                for (var j = 0; j<data.enemies.length; j++)
                {
                    enemy = data.enemies[j];
                    if (fight.name == enemy.name) break;
                }

                field = {name: enemy.name, value: '', inline: true}

                for (var j = 0; j<enemy.fights.length; j++)
                {
                    var fight = data.fights[enemy.fights[j].id-1];
                    field.value += "["+(fight.kill ? "✅" : "❌") + " - ";
                    field.value += convertMilliseconds(fight.kill ? fight.start_time : fight.end_time);
                    field.value += "]("+link+"#fight="+fight.id+") "+"\n";
                    if (fight.kill) break;
                }

                fields.push(field);
            }
        }

        fields.push({name:'See the full log:',value:'['+link+']('+link+')'});

        message.channel.send("Latest log:", {embed: {thumbnail:{ url: 'https://dmszsuqyoe6y6.cloudfront.net/img/warcraft/zones/zone-'+data.zone+'-small.jpg' },fields}});
    }

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
            try {
                getLatestLog(guildId);
                db.push('/warcraftlogs/guilds/' + id, guildId);
            } catch (error) {
                message.reply(`Something went wrong. See the **${config.commandPrefix}help** command on how to do it right.`)
            }
            break;
        default:
            try {
                var guild = db.getData('/warcraftlogs/guilds/' + id);
                getLatestLog(guild);
                message.delete();
            } catch (error) {
                message.reply(`There is no WarcraftLogs Guild related to this discord server. See the **${config.commandPrefix}help** command on how to set it.`);
            }
            break;
    }
}

module.exports = WarcraftLogs;
