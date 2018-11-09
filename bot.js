// Load .env file that has TOKEN
require('dotenv').config();

const request = require('request');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const baseUrl = 'https://api.github.com/repos/JBossOutreach/';

bot.onText(/\/getinfo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const enteredText = match[1];

  const finalUrl = baseUrl + enteredText;
  console.log(finalUrl);

  const options = {
    url: finalUrl,
    json: true,
    headers: {
      'User-Agent': 'request',
    },
  };

  function callback(error, response, body) {
    if (error) {
      console.error(error);
      return;
    }

    const name = body.name;
    const language = body.language;
    const license = body.license.name;
    const stars = body.watchers;
    const forks = body.forks;
    const githubLink = body.html_url;

    const output = `Repository ${name}\nMain language: ${language}\nLicense: ${license}\nStars: ${stars}\nForks: ${forks}\nGithub link: ${githubLink}`;

    bot.sendMessage(chatId, output);
    console.log(`Status code: ${response.statusCode}`);
  }

  request(options, callback);
});


// Can be useful in future
/*
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'I listen :)');
});
*/
