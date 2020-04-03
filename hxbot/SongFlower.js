var SongFlower = function () {};

SongFlower.prototype.Message = function(message)
{
    var msg = message.content.split(" ");

    var timer = new Date();

    switch (msg[1]) {
        case '':
        case null:
        case undefined:
            break;
        case 'now':
            break;
        default:
            var res = msg[1].match(/(\d?\d).?(\d\d)/);
            if ( res.length < 3 ) break;
            if (parseInt(res[1]) < 12) {
                var timers = [0]
                timer.setHours(res[1],res[2]);
            } else {
                timer.setHours(res[1], res[2]);
            }
    }

    const timeStamp = (date) => {
        return (date.getHours()<10 ? '0' : '') + date.getHours()+':'+(date.getMinutes()<10 ? '0' : '') +date.getMinutes();
    }

    const renderSongflower = () => {
        var out = '```'
        out += 'If a Songflower was picked at ' + timeStamp(timer) + ' it will respawn at the following times:\n'
        var tempTime = timer;
        for (var i = 1; i < 9; i++) {
            tempTime.setMinutes(tempTime.getMinutes() + 25)
            tempTime.setSeconds(tempTime.getSeconds() + 1.5)
            out += timeStamp(tempTime) + (i % 4 ? ', ' : '\n')
        }
        out += '```'
        return out;
    }


    message.channel.send(renderSongflower())
    //message.channel.send(`Next Onyxia reset is in **${renderCountdown()}**\nUpcoming resets and kill windows:\n\`\`\`${renderCalendar()}\`\`\`*(Every reset is at 06:00 AM server time)*\nMolten Core always resets on Wednesday morning.`)
}

module.exports = SongFlower;
