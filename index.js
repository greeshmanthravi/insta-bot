const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const insta = require('instagram-scraping');

const CONFIG = {
  token: process.env.TOKEN,
  channelId: "1469593862774194176",
  username: "the_rgyt"
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

let lastPost = null;

client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

async function checkInstagram() {
  try {
    const data = await insta.scrapeUserPage(CONFIG.username);

    if (!data.medias || data.medias.length === 0) {
      console.log("⚠️ No posts found or blocked");
      return;
    }

    const latest = data.medias[0].shortcode;

    if (lastPost && lastPost !== latest) {
      const channel = await client.channels.fetch(CONFIG.channelId);

      await channel.send(
        `@everyone 📸 **New Instagram Post!**\nhttps://www.instagram.com/p/${latest}/`
      );
    }

    lastPost = latest;

  } catch (err) {
    console.log("⚠️ Instagram blocked, retrying...");
  }
}

// every 1 minute
cron.schedule('* * * * *', checkInstagram);

// backup check every 30 sec
setInterval(checkInstagram, 30000);

client.login(CONFIG.token);
