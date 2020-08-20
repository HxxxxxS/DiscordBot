var request = require('request'),
    cachedRequest = require('cached-request')(request),
    JsonDB = require('node-json-db'),
    config = require('../config.json'),
    URL = require('url').URL;

cachedRequest.setCacheDirectory('/tmp/cache');

var db = new JsonDB('database', true, true);

var WarcraftLogs = function () {};

const raids = {
    1000: 'Molten Core',
    1001: 'Onyxia\'s Lair',
    1002: 'Blackwing Lair',
    1003: 'Zul\'Gurub',
    1004: 'Ruins of Ahn\'Qiraj',
    1005: 'Temple of Ahn\'Qiraj'
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

const doRequest = (url) => {
    return new Promise((onSuccess, onError) => {
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
                data.requestOrigin = url;
                onSuccess(data);
            }else{
                onError((error?error:response));
            }
        });

    })
}

const stripCode = (code) => {
    if (!code) return false;
    if(code.indexOf("#") > -1) code = code.split("#")[0]; // Remove everything after #
    if(code.indexOf("?") > -1) code = code.split("?")[0]; // Remove everything after ?
    code = code.replace(/\/$/, '')
    code = code.split("/")[code.split("/").length - 1];   // Remove everything before /
    return code;
}

const getSpecificLog = (code) => {
    return new Promise((onSuccess, onError) => {
        console.log('getSpecificLog called!');
        let url = `https://classic.warcraftlogs.com/v1/report/fights/${stripCode(code)}?api_key=${config.warcraft_logs.apikey}`;
        doRequest(url)
        .then((data) => {
            onSuccess(data);
        })
        .catch((error) => {
            onError(error);
        });
    })
}

const getLatestLog = (guildId) => {
    return new Promise((onSuccess, onError) => {
        console.log('getLatestLog called!');
        let zone = guildId.split('|')[1];
        let guild = guildId.split('|')[0];
        let url = `https://classic.warcraftlogs.com/v1/reports/guild/${guild}?api_key=${config.warcraft_logs.apikey}`
        doRequest(url)
        .then((data) => {
            getSpecificLog(data[0].id)
            .then((data) => {
                onSuccess(data);
            })
            .catch((error) => {
                onError(error);
            })
        })
        .catch((error) => {
            onError(error);
        });
    });
}

const drawFight = (fight, link) => {
    let timeStart = convertMilliseconds(fight.start_time);
    let timeEnd = convertMilliseconds(fight.end_time);
    let length = convertMilliseconds(fight.end_time - fight.start_time);
    let fightLink = link + '#fight=' + fight.id;
    let ret = (fight.kill ? "✅" : "❌") + ' - ';
    ret += `[${timeEnd}](${fightLink} '${fight.name} ${(fight.kill ? 'kill' : 'wipe')} from ${timeStart} to ${timeEnd}`
    ret += ` | Fight length: ${length}') ${(fight.kill||fight.boss==610?'':fight.fightPercentage/100+'%')}\n`
    return ret;
}

const drawOutput = (data, cb) => {
    console.log('drawOutput called!');
    let code = stripCode(data.requestOrigin);
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
    let bosses = [];
    let timer = 0;
    for (let i = 0; i<data.fights.length; i++)
    {
        let encounter = data.fights[i];
        if (encounter.boss) {
            if (bosses.indexOf(encounter.boss) > -1) continue;
            let name = (encounter.name.length > 21 ? encounter.name.split(' ')[0] : encounter.name);
            let fieldFrame = {name: name, inline: true, value: '\u200b'}
            let field = JSON.parse(JSON.stringify(fieldFrame));
            field.value += drawFight(encounter, link);
            timer = encounter.end_time;
            bosses.push(encounter.boss);
            if (!encounter.kill) {
                for (let j = i; j < data.fights.length; j++) {
                    if (data.fights[j].end_time <= timer) continue;
                    timer = data.fights[j].end_time;
                    let fight = drawFight(data.fights[j]);
                    if (field.name.length + field.value.length + fight.length >= 1024) {
                        embed.fields.push(field);
                        field = JSON.parse(JSON.stringify(fieldFrame));
                    }
                    if (data.fights[j].boss == encounter.boss) {
                        field.value += drawFight(data.fights[j], link);
                    }
                    if (data.fights[j].kill) break;
                }
            }
            embed.fields.push(field)
        }
    }
    if (bosses.length % 3 != 0) embed.fields.push({name:"\u200b ",value:"\u200b ",inline:true});
    embed.fields.push({name:'See the full log:',value:link});
    cb.edit({embed: embed, split: true});
}

const getWorldbuffs = (code, start) => {
    console.log('getWorldbuffs called!');
    return new Promise((onSuccess, onError) => {
        let url = `https://classic.warcraftlogs.com/v1/report/events/${code}?type=combatantinfo&start=${start}&end=${start}&api_key=${config.warcraft_logs.apikey}`;
        doRequest(url)
        .then((data) => {
            onSuccess(data)
        })
        .catch((error) => {
            onError(error);
        });
    });
}

const drawWorldbuffs = (data, log, cb) => {
    console.log('drawWorldbuffs called!');
    let events = data.events;
    console.log(`Checking ${log.friendlies.length} friendlies and ${events.length} events`);
    let code = stripCode(data.requestOrigin);
    let link = `https://classic.warcraftlogs.com/reports/${code}`;
    let header = {
        title: `Worldbuffs for ${log.title} ${new Date(log.start).toDateString()}`,
        url: link,
        thumbnail: {url:log.img},
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

    let fields = [];
    let buff_errors = {count:0}

    for (var i = friendlies.length - 1; i >= 0; i--) {
        let player = friendlies[i];
        if(!player) continue;
        const icon = emojis.find(emoji => emoji.name === player.type.split('-')[0]);
        let field = {
            name: `${(icon?icon+' ':'')}${player.name}`,
            value: [],
            inline: true
        };
        for (var j = 0; j < player.buffs.length; j++) {
            let buff = player.buffs[j];
            if (!buff) continue;
            if (buff.name)
                buff.name = buff.name.toLowerCase().replace(/\s/g, 'O').replace(/\W/g, '').replace(/O/g,'_');
            else
                buff.name = buff.icon.toLowerCase().replace(/\.(jpg|png)/,'')
            if (buff.icon.split('.')[0] == 'inv_misc_orb_02') buff.name = 'sayges_dark_fortune';
            let emoji = emojis.find(emoji => emoji.name === buff.name);
            if(!emoji) {
                console.log(`Missing emoji for ${buff.name} ${buff.id}`);
                emoji = '❔';
                if(buff_errors[buff.id])
                    buff_errors[buff.id].count++;
                else{
                    buff_errors[buff.id] = buff;
                    buff_errors[buff.id].count = 1;
                }
                buff_errors.count++;
            }
            field.value.push(emoji);
            if ((j+1) % 5 == 0) {
                //field.value.push("\n");
            }
        }
        if(field.name && field.value.length){
            fields.push(field);
        }
    }

    fields.sort((a,b) => {
        return b.value.length - a.value.length;
    });

    var page = 1;
    var i = -1;
    var l = 0;

    if (!fields.length) {
        cb.edit({embed:header});
    }

    do {
        i++;
        if(!fields[i]) break;
        fields[i].value = fields[i].value.join('').trim()+'\u200b';
        l += fields[i].value.length + fields[i].name.length;
        if ((l > 3500 && (i+1) % 3 == 0) || i >= fields.length-1) {
            let embed = JSON.parse(JSON.stringify(header));
            embed.title = `${embed.title} #${page}:`;
            embed.fields = fields.splice(0, i+1);
            i = -1;
            l = 0;
            while (i >= fields.length-1 && embed.fields.length % 3 > 0) {
                embed.fields.push({name:"\u200b", value:"\u200b", inline: true});
            }
            if (page == 1) {
                cb.edit({embed:embed});
            } else {
                cb.channel.send({embed:embed});
            }
            page ++;
        }
    } while (fields.length > 0);
    if (buff_errors.count) {
        let error_field = "\u200b";
        for (key in buff_errors) {
            if (key == 'count') continue;
            let buff = buff_errors[key];
            error_field += "https://classicdb.ch/?spell="+buff.id+" x"+buff.count+"\n";
        }
        let error = {fields:[{name:`${buff_errors.count} unknown buffs found:`,value:error_field}]}
        error.fields.push({name: "\u200b", value: 'This shouldnt happen. Ping <@167357644825296896>'})
        cb.channel.send({embed:error})
    }
    console.log('done looping');
}

const errorHandler = (error, message) => {
    if (error.body) {
        let body = JSON.parse(error.body);
        message.edit(`**Error ${body.status}: ${body.error}**`);
    } else {
        console.log('error:', error, ':error');
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
            message.channel.send(`Okay. Your guildID is \`${guildId}\`..`);
            try {
                message.channel.send(`Finding your latest uploaded log...`)
                .then((sent) => {
                    getLatestLog(guildId)
                    .then((data) => {
                        let code = stripCode(data.requestOrigin);
                        drawOutput(data, sent);
                        db.push('/warcraftlogs/guilds/' + id, guildId);
                    });
                })
            } catch (error) {
                message.reply(`Something went wrong. Expected syntax: logs [set] [classic|retail region realm Guild Name]`)
            }
            break;
        case 'latest':
        case undefined:
            var guildId = db.getData('/warcraftlogs/guilds/' + id);
            var zone = guildId.split('|')[1];
            var guild = guildId.split('|')[0];
            message.channel.send('Getting latest log...')
            .then((sent) => {
                getLatestLog(guildId)
                .then((data) => {
                    drawOutput(data, sent);
                })
                .catch((error) => {
                    errorHandler(error, sent);
                });
            });
            message.delete();
            break;
        case 'worldbuffs':
        case 'wb':
        case 'buffs':
            var code = stripCode(msgArr[2]);
            message.channel.send(`Getting worldbuffs for ${code}...`)
            .then((sent) => {
                getSpecificLog(code)
                .then((log) => {
                    sent.edit(`Getting worldbuffs for ${log.title} ${new Date(log.start).toDateString()}`);
                    let url = log.requestOrigin;
                    let start = 0;
                    log.img = `https://dmszsuqyoe6y6.cloudfront.net/img/warcraft/zones/zone-${log.zone}-small.jpg`;
                    if (msgArr[2].indexOf('#')>-1 && msgArr[2].indexOf("http")>-1)
                    {
                        var u = new URL(msgArr[2].replace('#','?'));
                        if (u.searchParams.get('fight'))
                        {
                            var i = Math.max(u.searchParams.get('fight')-1,0);
                            if (log.fights[i].hasOwnProperty('originalBoss'))
                            {
                                if (log.fights[i+1].id == log.fights[i].originalBoss) {
                                    i = i+1;
                                }
                            }
                            start = log.fights[i].start_time;
                            log.title = `${log.title} - ${log.fights[i].name}`;
                            log.img = `https://assets.rpglogs.com/img/warcraft/bosses/${(log.fights[i].boss || log.fights[i].originalBoss)}-icon.jpg`
                        }
                    }
                    if (msgArr[3])
                    {
                        var i = msgArr[3];
                        start = log.fights[i].start_time;
                    }
                    if (!start)
                    {
                        for (var i = log.fights.length - 1; i >= 0; i--) {
                            if (log.fights[i].boss > 0 || log.fights[i].hasOwnProperty('originalBoss')) {
                                start = log.fights[i].start_time;
                            }
                        }
                    }
                    getWorldbuffs(code, Math.max(start,0))
                    .then((data) => {
                        drawWorldbuffs(data, log, sent);
                    })
                    .catch((error) => {
                        errorHandler(error, sent);
                    });
                })
                .catch((error) => {
                    errorHandler(error, sent);
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
                getSpecificLog(link)
                .then((data) => {
                    let code = stripCode(data.requestOrigin);
                    drawOutput(data, sent);
                })
                .catch((error) => {
                    errorHandler(error, sent);
                })
            })
            message.delete();
            break;
        default:
            message.channel.send('Getting specified log...')
            .then((sent) => {
                getSpecificLog(msgArr[1])
                .then((data) => {
                    drawOutput(data, sent);
                })
                .catch((error) => {
                    errorHandler(error, sent);
                });
            });
            message.delete();
            break;

    }
}

module.exports = WarcraftLogs;
