var OnyxiaModule = function () {};

OnyxiaModule.prototype.Message = function(message)
{
    let nextReset = new Date('2019-10-21T06:00:00.000Z');

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
    while (currentDate > nextReset)
    {
        nextReset.setDate(nextReset.getDate() + 5);
    }

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const renderResetDate = () => {
      return `${days[nextReset.getDay()]}, ${months[nextReset.getMonth()]} ${nextReset.getDate()}, ${nextReset.getFullYear()} @ ${nextReset.getHours()}:00${nextReset.getHours() < 12 ? 'AM' : 'PM'} (Server Time)`;
    }

    const renderCountdown = () => {
        const seconds = convertMilliseconds(nextReset - currentDate, 's');
        const minutes = convertMilliseconds(nextReset - currentDate, 'm');
        const hours = convertMilliseconds(nextReset - currentDate, 'h');
        const days = convertMilliseconds(nextReset - currentDate, 'd');
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    message.reply(`Next Onyxia reset is ${renderResetDate()}, thats in ${renderCountdown()}`)

}

module.exports = OnyxiaModule;

