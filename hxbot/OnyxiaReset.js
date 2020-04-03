var OnyxiaModule = function () {};

OnyxiaModule.prototype.Message = function(message)
{
    var reset = new Date('2019-12-30T07:00:00.000Z');

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
        reset.setDate(reset.getDate() + 5);
    }

    const renderCountdown = () => {
        const seconds = convertMilliseconds(reset - currentDate, 's');
        const minutes = convertMilliseconds(reset - currentDate, 'm');
        const hours = convertMilliseconds(reset - currentDate, 'h');
        const days = convertMilliseconds(reset - currentDate, 'd');
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    const renderCalendar = () => {
        var cal = "Mon    Tue    Wed    Thu    Fri    Sat    Sun\n"
        for (var i = 0 - reset.getDay(); i < 21 - reset.getDay(); i++) {
            var day = new Date();
            day.setMonth(reset.getMonth())
            day.setDate(reset.getDate() + i + 1);

            if (day.getDay() == 1) cal += "\n";

            var text = ([reset.getDate(), reset.getDate() + 5, reset.getDate() + 10, reset.getDate() + 15].indexOf(day.getDate()) > -1 ? 'RE' : day.getDate());
            cal+= (" ".repeat(2 - text.toString().length)) + text + (day.getDay()>0 ? "     " : "\n");
        }
        return cal;
    }

    message.channel.send(`Next Onyxia reset is in **${renderCountdown()}**\nUpcoming resets and kill windows:\n\`\`\`${renderCalendar()}\`\`\`*(Every reset is at 07:00 AM server time)*\nMolten Core and Blackwing Lair always resets on Wednesday morning.`)
}

module.exports = OnyxiaModule;
