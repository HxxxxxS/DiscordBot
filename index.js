const Discord = require('discord.js');
const HxBot = require('./hxbot/index.js');

const hx = new HxBot;
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
    var l = Object.keys(client.channels).length;
    console.log(`Serving in ${l+1} channel${(l>1?'s':'')}.`);
    client.user.setGame(hx.config.commandPrefix+'help');
    hx.DbHelper.Init();
    console.log('Ready for action!');
});

client.on('guildMemberAdd', function(member)
{
    hx.guildMemberAdd(member);
});

client.on('guildMemberRemove', function(member)
{
    hx.guildMemberRemove(member);
});

client.on('message', function(msg)
{
    if( msg.author.id != client.user.id )
    {
        var cmd = hx.getCommand(msg);
        if( cmd )
        {
            hx[cmd].Message(msg);
        }else{
            hx.checkMessageForEasterEggs(msg);
        }
    }
});

client.login(hx.config.discord.token);
