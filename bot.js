// Load .env file that has TOKEN
require('dotenv').config();

const request = require('request-promise-native');
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

console.log('Bot is running...');

bot.onText(/\/getinfo (.+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message (so in this case, basically everything following /getinfo)
  const chatId = msg.chat.id;
  const input = match[1];
  logNewQuery(input);

  const url = await processUrl(input);
  const message = await processMessage(url);
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Makes a request to get an array of URLs to which we can compare text entered by user
// Returns URL of the most probable repository
async function processUrl(text) {
  let finalUrl;
  await request(reposUrl, requestOptions, (error, response, body) => {
    if (error) {
      console.error(error);
    }

    const linksArray = [];
    const gotJSON = body;
    for (let i = 0; i < gotJSON.length; i++) {
      const link = gotJSON[i].name;
      linksArray.push(link);
    }

    const matches = similarity.findBestMatch(text, linksArray);
    const bestMatch = matches.bestMatch.target;
    finalUrl = baseUrl + bestMatch;
    console.log(`Best match: ${bestMatch}, url ${finalUrl} will be queried`);
  });

  return finalUrl;
}

// Makes a request to get data of the particular repository
async function processMessage(url) {
  console.log(`URL: ${url}`);
  let message;
  await request(url, requestOptions, (error, response, body) => {
    if (error) {
      console.error(error);
    }
    // Print response status
    console.log(`Status code: ${response.statusCode} ${response.statusMessage}`);

    const name = body.name;
    const language = body.language;
    const stars = body.watchers;
    const forks = body.forks;
    const githubLink = body.html_url;
    // Some repositories don't have license
    let license;
    if (body.license != null) {
      license = body.license.name;
    } else {
      license = 'No license';
    }

    // Markdown-styled text that will be sent
    message = `Closest match for your query is
*${name}*
Main language: ${language}
License: ${license}
Stars: ${stars}
Forks: ${forks}
Github: ${githubLink}`;
  });

  return message;
}

// Log the query and time
function logNewQuery(input) {
  const date = new Date();
  const utcDate = date.toUTCString();

  console.log('------------------------------------------');
  console.log(`New query has occurred on ${utcDate}\nQuery: ${input}`);
}

// Provide help feature
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `/getinfo repository

*For example:* /getinfo leadandro *or* /getinfo lead-management-android`;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});
