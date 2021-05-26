const fs = require("fs");
const { Client, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const getData = require("./helper/gempa");
const { data } = require("cheerio/lib/api/attributes");
const base64img = require("./helper/base64img");
const convertYtToMP3 = require("./helper/convertYt");
const getLyrics = require("./helper/getLyrics");
const getDownloadLink = require("./helper/getTiktokNoWm");
// Path where the session data will be stored
const SESSION_FILE_PATH = "./session.json";

// Load the session data if it has been previously saved
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
  session: sessionData,
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-extensions"],
  },
});

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

// Save session values to the file upon successful auth
client.on("authenticated", (session) => {
  sessionData = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
    if (err) {
      console.error(err);
    }
  });
});

// Function Check Admin at Group
const checkAdmin = (participants, sender) => {
  const checker = participants.filter((item) => item.id._serialized === sender);
  if (checker.length > 0) {
    return checker[0].isAdmin;
  } else {
    return false;
  }
};

client.on("message", async (message) => {
  try {
    const chat = await message.getChat();
    if (message.body === "!status") {
      message.reply("[BOT] ACTIVE");
    } else if (chat.isGroup && message.body === "!everyone") {
      const checkAdmins = await checkAdmin(chat.groupMetadata.participants, message.author);
      if (checkAdmins) {
        let text = "";
        let mentions = [];
        for (let participant of chat.participants) {
          const contact = await client.getContactById(participant.id._serialized);
          mentions.push(contact);
          text += `@${participant.id.user} `;
        }
        await chat.sendMessage(text, { mentions });
      }
    } else if (message.hasMedia && message.type === "image") {
      if (message.body === "!sticker") {
        const receiveMedia = await message.downloadMedia();
        if (receiveMedia.mimetype && receiveMedia.data) {
          const media = new MessageMedia(receiveMedia.mimetype, receiveMedia.data);
          await client.sendMessage(message.from, media, { sendMediaAsSticker: true });
        }
      }
    } else if (message.body === "!sticker" && message.hasQuotedMsg) {
      let receiveMedia = await message.getQuotedMessage();
      receiveMedia = await receiveMedia.downloadMedia();
      if (receiveMedia.mimetype && receiveMedia.data) {
        const media = new MessageMedia(receiveMedia.mimetype, receiveMedia.data);
        await client.sendMessage(message.from, media, { sendMediaAsSticker: true });
      }
    } else if (message.body === "!gempa") {
      const dataGempa = await getData();
      const dataMedia = await base64img(dataGempa.image);
      const media = new MessageMedia(dataMedia.mimetype, dataMedia.data);
      await client.sendMessage(message.from, media, { caption: dataGempa.data });
    } else if (message.body.startsWith("!ytmp3 ")) {
      const url = message.body.split(" ")[1];
      await message.reply("Please Wait . . .");
      await convertYtToMP3(url, "mp3")
        .then((result) => {
          message.reply(`[SUCCESS][YTMP3]
Title : ${result.title}
Bitrate : ${result.bitrate}
Type File : ${result.type}
Link Download : ${result.link}
`);
        })
        .catch((err) => {
          message.reply(`[FAILED][YTMP3] ${err.message}`);
        });
    } else if (message.body.startsWith("!ytmp4 ")) {
      const url = message.body.split(" ")[1];
      await message.reply("Please Wait . . .");
      await convertYtToMP3(url, "mp4")
        .then((result) => {
          message.reply(`[SUCCESS][YTMP4]
Title : ${result.title}
Bitrate : ${result.bitrate}
Type File : ${result.type}
Link Download : ${result.link}
`);
        })
        .catch((err) => {
          message.reply(`[FAILED][YTMP4] ${err.message}`);
        });
    } else if (message.body.startsWith("!lyrics ")) {
      const query = message.body.slice(8);
      await getLyrics(query)
        .then((result) => {
          message.reply(result);
        })
        .catch((err) => {
          message.reply(err);
        });
    } else if (message.body.startsWith("!tt ")) {
      const url = message.body.split(" ")[1];
      await message.reply("Please wait . . .");
      await getDownloadLink(url)
        .then((result) => {
          message.reply(`[SUCCESS][TIKTOK NO WM]
Download : ${result.link}`);
        })
        .catch((err) => {
          message.reply(`[FAILED][TIKTOK NO WM]
Reason : ${err.message}`);
        });
    }
  } catch (error) {
    console.log(`[BOT] => Something Error`);
  }
});
