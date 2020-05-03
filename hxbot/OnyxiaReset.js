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
