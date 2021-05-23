const fs = require("fs");
const { Client, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const getData = require("./helper/gempa");
const { data } = require("cheerio/lib/api/attributes");
const base64img = require("./helper/base64img");
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
    }
  } catch (error) {
    console.log(`[BOT] => Something Error`);
  }
});
