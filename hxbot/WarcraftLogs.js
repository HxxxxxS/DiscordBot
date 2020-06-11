var request = require('request'),
    cachedRequest = require('cached-request')(request),
    JsonDB = require('node-json-db'),
    config = require('../config.json');

cachedRequest.setCacheDirectory('/tmp/cache');

var db = new JsonDB('database', true, true);

var WarcraftLogs = function () {};

const raids = {
    1000: 'Molten Core',
    1001: 'Onyxia\'s Lair',
    1002: 'Blackwing Lair',
    1003: 'Zul\'Gurub'
}

const convertMilliseconds = (miliseconds) => {
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
    ret += (hours > 9 ? hours : '0'+hours)+':';
    ret += (minutes > 9 ? minutes : '0'+minutes)+':';
    ret += (seconds > 9 ? seconds : '0'+seconds);

    return ret;
};

const doRequest = (url, cb) => {
    let headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'https://github.com/HxxxxxS/DiscordBot'
    }

    let options = {
        url: url,
        port: 443,
        method: 'GET',
        ttl: 5 * 60 * 1000,
        headers: headers,
        timeout: 15000
    }

    console.log('requesting '+url);

    cachedRequest(options, (error, response, body) => {
        console.log(`request returned status ${response.statusCode}`);
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            cb(data, url);
        }else{
            console.log((error?error:response));
            message.channel.send(`Error: ${response.statusCode}`);
        }
    });
}

const stripCode = (code) => {
    if(code.indexOf("http") > -1){
        if(code.indexOf("#") > -1) code = code.split("#")[0]; // Remove everything after #
        if(code.indexOf("?") > -1) code = code.split("?")[0]; // Remove everything after ?
        code = code.split("/")[code.split("/").length - 1];   // Remove everything before /
    }
    return code;
}

const getSpecificLog = (code, cb) => {
    console.log('getSpecificLog called!');
    let url = `https://classic.warcraftlogs.com/v1/report/fights/${stripCode(code)}?api_key=${config.warcraft_logs.apikey}`;
    doRequest(url, (data, url) => {
        cb(data, url);
    });
}

const getLatestLog = (guildId, cb) => {
    console.log('getLatestLog called!');
    let zone = guildId.split('|')[1];
    let guild = guildId.split('|')[0];
    let url = `https://classic.warcraftlogs.com/v1/reports/guild/${guild}?api_key=${config.warcraft_logs.apikey}`
    doRequest(url, (data, url) => {
        getSpecificLog(data[0].id, cb);
    });
}

const drawOutput = (data, code, cb) => {
    console.log('drawOutput called!');
    let link = `https://classic.warcraftlogs.com/reports/${code}`;
    let embed = {
        title: data.title,
        url: link,
        thumbnail:{ url: 'https://dmszsuqyoe6y6.cloudfront.net/img/warcraft/zones/zone-'+data.zone+'-small.jpg' },
    }
    embed.fields = [{
        name: '\u200b',
        value:  (data.title != raids[data.zone] ? 'Zone: **' + raids[data.zone] + "**\n" : '') +
                'Date: **' + new Date(data.start).toDateString() + "**\n" +
                'Duration: **' + convertMilliseconds(data.end - data.start) + "**\n"
    },{name:'\u200b',value:'Bosses:'}];
    var bosses = [];
    var timer = 0;
    for (var i = 0; i<data.fights.length; i++)
    {
        var fight = data.fights[i];
        if (fight.end_time < timer) break;
        if (fight.boss)
        {
            if (bosses.indexOf(fight.boss)>-1) continue;
            bosses.push(fight.boss);
            var enemy;
            for (var j = 0; j<data.enemies.length; j++)
            {
                enemy = data.enemies[j];
                if (fight.name == enemy.name) break;
                if (data.enemies[j].type != "Boss") enemy = undefined;
            }
            if (!enemy) continue;
            var name = (enemy.name.length > 21 ? enemy.name.split(' ')[0] : enemy.name);
            field = {name: name, value: '', inline: true}
            for (var j = 0; j<enemy.fights.length; j++)
            {
                var spec_fight = data.fights[enemy.fights[j].id-1];
                if (!spec_fight.boss) continue;
                if (field.value.length > 666)
                {
                    fields.push(field);
                    field = {name: name, value: '', inline: true}
                }
                var timeStart = convertMilliseconds(spec_fight.start_time),
                    timeEnd = convertMilliseconds(spec_fight.end_time);
                field.value += (spec_fight.kill ? "✅" : "❌") + " - ";
                field.value += "["+timeEnd;
                field.value += "]("+link+"#fight="+spec_fight.id+" '";
                field.value += enemy.name+" "+(spec_fight.kill?'kill':'wipe')+" from "+timeStart+" to "+timeEnd+" | Length: "+convertMilliseconds(spec_fight.end_time-spec_fight.start_time)+"') "+"\n";
                if (spec_fight.kill) break;
            }

            embed.fields.push(field);
        }
        if (fight.end_time > timer) timer = fight.end_time;
    }
    if (bosses.length % 3 != 0) embed.fields.push({name:"\u200b ",value:"\u200b ",inline:true});
    embed.fields.push({name:'See the full log:',value:link});
    cb.edit({embed: embed});
}

const getWorldbuffs = (code, start, cb) => {
    console.log('getWorldbuffs called!');
    let url = `https://classic.warcraftlogs.com/v1/report/events/${code}?type=combatantinfo&start=${start}&end=${start}&api_key=${config.warcraft_logs.apikey}`;
    doRequest(url, (data, url) => {
        cb(data.events, url);
    });
}

const drawWorldbuffs = (events, log, url, cb) => {
    console.log('drawWorldbuffs called!');
    console.log(`Checking ${log.friendlies.length} friendlies and ${events.length} events`);
    let code = stripCode(url);
    let link = `https://classic.warcraftlogs.com/reports/${code}`;
    let embed = {
        title: `Worldbuffs for ${log.title} ${new Date(log.start).toDateString()}:`,
        url: link,
        fields: []
    }

    let friendlies = [];

    for (var i = log.friendlies.length - 1; i >= 0; i--) {
        let player = log.friendlies[i];
        if (!player.hasOwnProperty('server')) continue;
        friendlies[player.id] = {name: player.name, type: player.type, icon: player.icon, buffs: []};
    }

    for (var i = events.length - 1; i >= 0; i--) {
        var event = events[i];
        if (event.type !== 'combatantinfo') continue;
        if (event.hasOwnProperty('auras')) {
            for (var j = event.auras.length - 1; j >= 0; j--) {
                var aura = event.auras[j];
                friendlies[event.sourceID].buffs.push({name:aura.name,id:aura.ability,icon:aura.icon});
            }
        }
    }

    const emojis = cb.client.emojis;

    var l = 0;

    var fields = [];

    for (var i = friendlies.length - 1; i >= 0; i--) {
        let player = friendlies[i];
        if(!player) continue;
        const icon = emojis.find(emoji => emoji.name === player.type.split('-')[0]);
        let field = {
            name: `${(icon?icon+' ':'')}${player.name}`,
            value: [],
            inline: true
        };
        for (var j = player.buffs.length - 1; j >= 0; j--) {
            let buff = player.buffs[j];
            if (!buff) continue;
            const emoji = emojis.find(emoji => emoji.name === buff.icon.split('.')[0]);
            field.value.push(emoji);
            //field.value.push(`[${emoji}](https://classicdb.ch/?spell=${buff.ability} '${buff.name}')`);
        }
        if(field.name && field.value.length){
            fields.push(field);
        }
    }

    fields.sort((a,b) => {
        return b.value.length - a.value.length;
    })


    for (var i = fields.length - 1; i >= 0; i--) {
        if (fields.length < 9) fields[i].inline = false;
        fields[i].value = fields[i].value.join('')+'\u200b';
        l+=fields[i].value.length+fields[i].name.length;
    }

    if (l > 5500) {
        let cutoff = Math.ceil(fields.length / 3);
        let fields2 = fields.splice(0, cutoff - (cutoff % 3));

        fields2.push({name:"Continued in next message ",value:"\u200b ",inline:false});
        fields.push({name:'See the full log:',value:link, inline:false});

        embed.fields = fields2;
        cb.edit({embed:embed});
        cb.channel.send({embed:{title:'\u200b',fields: fields}});
    } else {
        embed.fields = fields;
        cb.edit({embed: embed});
    }

}

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
    var guildId = db.getData('/warcraftlogs/guilds/' + id);
    var zone = guildId.split('|')[1];
    var guild = guildId.split('|')[0];

    var msgArr = message.content.split(" ");

    var action = msgArr[1];
    var aIndex = message.content.indexOf(action);

    switch (action) {
        case 'set':
            if (msgArr.length < 5) {
                message.reply(`You sent too few parameters. Expected syntax: logs [set] [classic|retail region realm Guild Name]`)
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
                message.reply(`Something went wrong. Expected syntax: logs [set] [classic|retail region realm Guild Name]`)
            }
            break;
        case 'latest':
        case undefined:
            message.channel.send('Getting latest log...')
            .then((sent) => {
                getLatestLog(guildId, (data, url) => {
                    let code = stripCode(url);
                    console.log(code);
                    drawOutput(data, code, sent);
                });
            });
            message.delete();
            break;
        case 'worldbuffs':
            let code = stripCode(msgArr[2]);
            message.channel.send(`Getting worldbuffs for ${code}...`)
            .then((sent) => {
                getSpecificLog(code, (log, url) => {
                    let start = 0;
                    for (var i = log.fights.length - 1; i >= 0; i--) {
                        if (log.fights[i].boss) {
                            start = log.fights[i].start_time;
                        }
                    }
                    if (log.zone == 1002) start = 0;
                    getWorldbuffs(code, Math.max(start,0), (data, url) => {
                        drawWorldbuffs(data, log, url, sent);
                    });
                });
            });
            break;
        case 'fix':
            if (msgArr.length < 3) {
                message.reply(`You sent too few parameters. Expected syntax: logs fix msgID url`)
                return false;
            }
            var msgID = msgArr[2];
            var link = msgArr[3];
            message.channel.fetchMessage(msgID)
            .then((sent)=>{
                getSpecificLog(link, (data, url) => {
                    let code = stripCode(url);
                    drawOutput(data, code, sent);
                })
            })
            message.delete();
            break;
        default:
            message.channel.send('Getting specified log...')
            .then((sent) => {
                getSpecificLog(msgArr[1], (data, url) => {
                    let code = stripCode(url);
                    drawOutput(data, code, sent);
                });
            });
            message.delete();
            break;

    }
}

module.exports = WarcraftLogs;
