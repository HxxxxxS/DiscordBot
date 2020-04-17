var OnyxiaModule = function () {};

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

    const renderCalendar = () => {
        var cal = "Mon    Tue    Wed    Thu    Fri    Sat    Sun\n"
        for (var i = 0 - reset.getDay(); i < 21 - reset.getDay(); i++) {
            var day = new Date();
            day.setMonth(reset.getMonth())
            day.setDate(reset.getDate() + i + 1);

            if (day.getDay() == 1) cal += "\n";

            var text = (resets.indexOf(day.getDate()) > -1 ? 'RE' : day.getDate());
            cal+= (" ".repeat(2 - text.toString().length)) + text + (day.getDay()>0 ? "     " : "\n");
        }
        return cal;
    }
    
    const renderColumn = (index) => {
        var col = "¯\n"
        for (var i = 0 - reset.getDay(); i < 21 - reset.getDay(); i++)
        {
            var day = new Date();
            day.setMonth(reset.getMonth());
            day.setDate(reset.getDate()+i+1);
            
            var text = (resets.indexOf(day.getDate()) > -1 ? 'RE' : day.getDate());
            var paddedDay = ("`" + " ".repeat(4 - Math.max(text.toString().length),1) + text + " ".repeat(4 - Math.max(text.toString().length/2),1) + "` ");

            if (day.getDate() == new Date().getDate()) paddedDay = "` today ` ";
            
            if (index == 0)
            {
                if (day.getDay() == 1)
                {
                    col += "`        `";
                    col += " | "+paddedDay+"\n\n";
                }
            } else if (index == 1)
            {
                if (day.getDay() == 2) col += paddedDay;
                if (day.getDay() == 3) col += paddedDay;
                if (day.getDay() == 4) col += paddedDay+" \n\n";
            } else if (index == 2)
            {
                if (day.getDay() == 5) col += paddedDay;
                if (day.getDay() == 6) col += paddedDay;
                if (day.getDay() == 0) col += paddedDay+" \n\n";
            }
        }
        return col;
    }
    
    message.channel.send(
    `Next Onyxia reset is in **${renderCountdown()}**`,{
        embed: {
            fields: [{
                name:'Upcoming resets and kill windows:',
                value: "-",
                inline: false
             },
             {
                name: "`        ` | `  Mon  `",
                value: renderColumn(0),
                inline: true
             },
             {
                name: "`  Tue  ` `  Wed  ` `  Thu   `",
                value: renderColumn(1),
                inline: true
             },
             {
                name: "`  Fri  ` `  Sat  ` `  Sun  `",
                value: renderColumn(2),
                inline: true
             }],
             footer: {
                text:`Every reset is at 08:00 AM server time\nMolten Core and Blackwing Lair always resets on Wednesday morning.`
             }
         }
     })
 }

module.exports = OnyxiaModule;
