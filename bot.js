const request = require('request');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '639410307:AAGs7mw314gU7axsg7ey1LGFv-Kdu7QoAjI';
const bot = new TelegramBot(TOKEN, {polling: true});

//example url for testing
const repoUrl = 'https://api.github.com/repos/JBossOutreach/lead-management-android';

bot.onText(/\/getstars (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const enteredText = match[1];

    var options = {
        url: repoUrl,
        json: true,
        headers: {
            'User-Agent': 'request'
        }
    };

    function callback(error, response, body) {
        if(error) {
            return console.log(error);
        }

        //print watchers so it can be easily debugged
        console.log(body.watchers);

        bot.sendMessage(chatId, "Response code " + response.statusCode);
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