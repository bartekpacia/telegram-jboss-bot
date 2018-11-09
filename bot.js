const request = require('request');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '639410307:AAGs7mw314gU7axsg7ey1LGFv-Kdu7QoAjI';
const bot = new TelegramBot(TOKEN, {polling: true});

//example url for testing
const baseUrl = 'https://api.github.com/repos/JBossOutreach/';

bot.onText(/\/getinfo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const enteredText = match[1];

    var finalUrl = baseUrl + enteredText;
    console.log(finalUrl);
    

    var options = {
        url: finalUrl,
        json: true,
        headers: {
            'User-Agent': 'request'
        }
    };

    function callback(error, response, body) {
        if(error) {
            return console.log(error);
        }

        var name = body.name;
        var language = body.language;
        var license = body.license.name;
        var stars = body.watchers;
        var forks = body.forks;
        var githubLink = body.html_url;
        
        var output = "Repository " + name +
                    "\nMain language: " + language +
                    "\nLicense: " + license +
                    "\nStars: " + stars + 
                    "\nForks: " + forks +
                    "\nGithub link: " + githubLink;

        bot.sendMessage(chatId, output);
        console.log("Status code: " + response.statusCode);
    }

    request(options, callback); 
});





//Can be useful in future
/*
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'I listen :)');
});
*/