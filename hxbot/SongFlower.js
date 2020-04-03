var SongFlower = function () {};

SongFlower.prototype.Message = function(message)
{
    var msg = message.content.split(" ");

    var timer = new Date();
    var seconds = false;

    switch (msg[1]) {
        case '':
        case null:
        case undefined:
        case 'now':
            seconds = true;
            break;
        default:
            var res = msg[1].match(/(\d?\d)\D?(\d\d)\D?(\d\d)?/);
            if ( res.length < 3 ) break;
            if (parseInt(res[1]) < 12) {
                var timers = [0]
                timer.setHours(res[1], res[2]);
            } else {
                timer.setHours(res[1], res[2]);
            }
            if(res[3]) {
                seconds = true
                timer.setSeconds(res[3])
            }
    }

    const timeStamp = (date) => {
        return (date.getHours()<10?'0':'')+date.getHours()+':'+(date.getMinutes()<10?'0':'')+date.getMinutes()+(seconds?':'+(date.getSeconds()<10?0:'')+date.getSeconds():'');
    }

    const renderSongflower = () => {
        if(msg[2] == undefined)
            var out = 'If a Songflower was picked at __**' + timeStamp(timer) + '**__, it will respawn at the following times:\n'
        else
            var out = 'Songflower at __' + msg[2] + '__ was picked at __**' + timeStamp(timer) + '**__ and will respawn at the following times:\n'
        out += '```'
        var tempTime = timer;
        for (var i = 1; i < 9; i++) {
            tempTime.setMinutes(tempTime.getMinutes() + 25)
            tempTime.setSeconds(tempTime.getSeconds() + 1.5)
            out += timeStamp(tempTime) + (i % 8 ? ',   ' : '')
        }
        out += '```'
        out += "*(Assuming it gets picked within seconds of respawning each time)*"
        return out;
    }


    message.channel.send(renderSongflower())
    //message.channel.send(`Next Onyxia reset is in **${renderCountdown()}**\nUpcoming resets and kill windows:\n\`\`\`${renderCalendar()}\`\`\`*(Every reset is at 06:00 AM server time)*\nMolten Core always resets on Wednesday morning.`)
}

module.exports = SongFlower;
