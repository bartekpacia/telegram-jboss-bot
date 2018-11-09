// Load .env file that has TOKEN
require('dotenv').config();

const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const similarity = require('string-similarity');

const TOKEN = process.env.TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const reposUrl = 'https://api.github.com/orgs/JBossOutreach/repos';
const baseUrl = 'https://api.github.com/repos/JBossOutreach/';
const requestOptions = {
  json: true,
  headers: {
    'User-Agent': 'request',
  },
};

bot.onText(/\/getinfo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  const enteredText = match[1];
  console.log(`Entered text: ${enteredText}`);
  const linksArray = [];
  let finalUrl = 'NULL';

  // Make a final request to get data from specific repo and send it to user
  function finalRequest() {
    request(finalUrl, requestOptions, (error, response, body) => {
      if (error) {
        console.error(error);
        return;
      }
      const name = body.name;
      const language = body.language;
      const stars = body.watchers;
      const forks = body.forks;
      const githubLink = body.html_url;
      let license;
      if (body.license != null) {
        license = body.license.name;
      } else {
        license = 'No license';
      }

      const output = `Repository ${name}\nMain language: ${language}\nLicense: ${license}\nStars: ${stars}\nForks: ${forks}\nGithub link: ${githubLink}`;

      bot.sendMessage(chatId, output);

      // Print response status
      console.log(`Status code: ${response.statusCode} ${response.statusMessage}`);
    });
  }

  // Make first request to have an array of URLs to query
  request(reposUrl, requestOptions, (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }

    const gotJSON = body;
    for (let i = 0; i < gotJSON.length; i++) {
      const link = gotJSON[i].name;
      linksArray.push(link);
    }
    console.log(linksArray);

    const matches = similarity.findBestMatch(enteredText, linksArray);
    const bestMatch = matches.bestMatch.target;
    finalUrl = baseUrl + bestMatch;
    console.log(`Final url: ${finalUrl}`);
    finalRequest();
  });
});
