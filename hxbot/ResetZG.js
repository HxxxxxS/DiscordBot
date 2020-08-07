var request = require('request')
    config = require('../config.json');

var ZGModule = function () {};

Date.prototype.getWeek = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

const pad = (number, length) => {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

ZGModule.prototype.Message = function(message)
{
    var reset = new Date('2020-04-28T07:00:00.000Z');

    const rcd = 3;

    const madnessCycleFull = ["Gri'lek", "Hazza'rah", "Renataki", "Wushoolay"];
    const madnessCycle = [" Grilek ", " Hazza  ", "  Rena  ", " Wusho  "];
    const madnessOriginWk = 16;
    
    const getMadnessBoss = (date) =>
    {
        let currWk = date.getWeek()
        let tmpWk = madnessOriginWk;
        let bossIndex = -1;
        
        while (tmpWk <= currWk)
        {
            bossIndex++;
            if (bossIndex>=madnessCycle.length) bossIndex = 0;
            tmpWk+=2;
        }
        return madnessCycle[bossIndex];
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

    let currentDate = new Date();

    while (currentDate > reset)
    {
        reset.setDate(reset.getDate() + rcd);
    }

    let resets = [];

    for (var i =-1; i<9; i++)
    {
        var num = reset.getDate() + (rcd*i);
        var mlength = new Date(reset.getYear(), reset.getMonth()+1, 0).getDate();
        
        if (num > mlength) num = num-mlength;

        resets.push(num);
    }

    const renderCountdown = () => {
        const seconds = convertMilliseconds(reset - currentDate, 's');
        const minutes = convertMilliseconds(reset - currentDate, 'm');
        const hours = convertMilliseconds(reset - currentDate, 'h');
        const days = convertMilliseconds(reset - currentDate, 'd');
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    var url = "https://labs.han.sx/ZG/zg.php?" + new Date().getDate()
            + '-' + new Date().getMonth() + '-' + message.author.id;

    message.channel.send(`Next Zul\'Gurub reset is in **${renderCountdown()}**`, {
        embed: {
            footer: {
                text:"Loading calendar..."
            },
            image: {
                title:'Zul\'Gurub Calendar',
                url: url
            }
        }
    })
    .then((reply) => {
        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'https://github.com/HxxxxxS/DiscordBot',
            'Authorization': 'Client-ID ' + config.imgur.clientID
        }

        var options = {
            url: 'https://api.imgur.com/3/image.json',
            port: 443,
            method: 'POST',
            headers: headers,
            form: { 
                image: url
            }
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body).data;
                changeToCached(data.link);
            }else{
                console.log((error?error:response));
            }
        });

        var changeToCached = (url) => {
            reply.edit(
                `Next Zul\'Gurub reset is in **${renderCountdown()}**`,{
                embed: {
                    footer: {
                        text:"🔄 - Reset this day\nThe names indicate Edge of Madness https://wowwiki.fandom.com/wiki/Edge_of_Madness boss of the week."
                    },
                    image: {
                        title:'Zul\'Gurub Calendar',
                        url: url
                    }
                }
            })
        }
    })
}

module.exports = ZGModule;
