var Urban = require('urban');

var UrbanModule = function () {};

UrbanModule.prototype.Message = function(message)
{
    var keyword = "define";
    var urbanIndex = message.content.indexOf(keyword);
    var term = message.content.substring(urbanIndex + keyword.length).trim().replace(/\s/g, "+");

    if (urbanIndex > -1) {
        Urban(term).first(function(json) {
            if (json !== undefined) {
                let embed = {
                        title: json.word,
                        fields: [{
                            name: `Definition:`,
                            value: json.definition.replace(/\[([\w\s]*)\]/g,`$1`)
                                                        //'[$1](https://www.urbandictionary.com/define.php?term=$1)')
                        },{
                            name: 'Example:',
                            value: json.example.replace(/\[([\w\s]*)\]/g, `$1`)
                                                        //`[$1](https://www.urbandictionary.com/define.php?term=$1 '${json.word}')`)
                        },{
                            name: '\u200b',
                            value:`[More definitions](https://www.urbandictionary.com/define.php?term=${term})`
                        }]
                }
                message.channel.send({embed:embed});
            }else{
                message.channel.send(`Sorry, I couldn't find a definition for: ${term}`);
            }
        });
    }
}

module.exports = UrbanModule;
