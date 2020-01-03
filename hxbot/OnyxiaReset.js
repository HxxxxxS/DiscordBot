var OnyxiaModule = function () {};

OnyxiaModule.prototype.Message = function(message)
{
    var resets = [
        new Date('2020-01-04T06:00:00.000Z'),
        new Date('2020-01-09T06:00:00.000Z'),
        new Date('2020-01-14T06:00:00.000Z'),
        new Date('2020-01-19T06:00:00.000Z')
    ]

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

    while (currentDate > resets[1])
    {
        resets[0].setDate(resets[0].getDate() + 5);
        resets[1].setDate(resets[1].getDate() + 5);
        resets[2].setDate(resets[2].getDate() + 5);
        resets[3].setDate(resets[3].getDate() + 5);
    }

    const renderCountdown = () => {
        const seconds = convertMilliseconds(resets[1] - currentDate, 's');
        const minutes = convertMilliseconds(resets[1] - currentDate, 'm');
        const hours = convertMilliseconds(resets[1] - currentDate, 'h');
        const days = convertMilliseconds(resets[1] - currentDate, 'd');
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    var cal = "```Mon    Tue    Wed    Thu    Fri    Sat    Sun\n"
    for (var i = 0 - resets[0].getDay(); i < 21 - resets[0].getDay(); i++) {
        var day = new Date();
        day.setMonth(resets[0].getMonth())
        day.setDate(resets[0].getDate() + i + 1);

        if (day.getDay() == 1) cal += "\n";

        var text = ([resets[0].getDate(), resets[1].getDate(), resets[2].getDate(), resets[3].getDate()].indexOf(day.getDate()) > -1 ? 'RE' : day.getDate());
        cal+= (" ".repeat(2 - text.toString().length)) + text + (day.getDay()>0 ? "     " : "\n");
    }
    cal+= '```';

    message.channel.send(`Next Onyxia reset is in **${renderCountdown()}**\nUpcoming resets and kill windows:\n${cal}*(Every reset is at 08:00 AM server time)*\nMolten Core always resets on Wednesday morning.`)
}

module.exports = OnyxiaModule;
