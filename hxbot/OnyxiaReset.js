var OnyxiaModule = function () {};

const pad = (number, length) => {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

OnyxiaModule.prototype.Message = function(message)
{
    var reset = new Date('2019-12-30T07:00:00.000Z');

    const rcd = 5;

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

    for (var i =-1; i<5; i++)
    {
        var num = reset.getDate() + (rcd*i);
        var mlength = new Date(currentDate.getYear(), currentDate.getMonth() + 1, 0).getDate();

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

    message.channel.send(
    `Next Onyxia reset is in **${renderCountdown()}**`,{
        embed: {
            footer: {
                text:"🔄 - Reset this day."
            },
            image: {
                title:'Upcoming resets and kill windows:',
                url: "https://labs.han.sx/ZG/ony.php?" + new Date().getDate() + '-' + new Date().getMonth()
            }
        }
     })
 }

module.exports = OnyxiaModule;
