const { cmd } = require("../zaidi");
const config = require("../config");
const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');

cmd({
  pattern: "vv",
  alias: ["viewonce", 'retrive'],
  react: '🐳',
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator, userConfig }) => {
  try {
    if (!isCreator) {
      return await client.sendMessage(from, {
        text: "*🙊YE CMD OWNER K LIYE HA *"
      }, { quoted: message });
    }

    // Quoted message check using Baileys structure
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return await client.sendMessage(from, {
        text: "*😁ARY VIEW ONCE PE REPLY KRO*"
      }, { quoted: message });
    }

    // Extract actual message from View-Once wrappers
    const voWrappers = ['viewOnceMessageV2', 'viewOnceMessageV2Extension', 'viewOnceMessage'];
    let actualMsg = null;
    for (const wrapper of voWrappers) {
      if (quoted[wrapper]?.message) {
        actualMsg = quoted[wrapper].message;
        break;
      }
    }

    // Direct check if not wrapped
    if (!actualMsg) {
      const directType = getContentType(quoted);
      if (directType === 'imageMessage' || directType === 'videoMessage' || directType === 'audioMessage') {
        actualMsg = quoted;
      }
    }

    if (!actualMsg) {
      return await client.sendMessage(from, {
        text: "*😞 YE VIEW ONCE NHI HA*"
      }, { quoted: message });
    }

    const mtype = getContentType(actualMsg);
    const mediaData = actualMsg[mtype];

    if (!mediaData) {
      return await client.sendMessage(from, {
        text: "❌ KOI MEDIA NHI"
      }, { quoted: message });
    }

    // Download media using standard Baileys method
    const stream = await downloadContentFromMessage(mediaData, mtype.replace('Message', ''));
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const originalCaption = mediaData.caption || '';
    const options = { quoted: message };

    // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
    const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION;

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : `> ${DESCRIPTION}`,
          mimetype: mediaData.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : `> ${DESCRIPTION}`,
          mimetype: mediaData.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: mediaData.ptt || false
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and VIOSE KO SUPORT KRTA HA"
        }, { quoted: message });
    }

    // Sends right there back to the same chat (group or inbox)
    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + error.message
    }, { quoted: message });
  }
});

cmd({
  pattern: "vv2",
  alias: ["wah", "ohh", "oho", "🙂", "😂", "❤️", "💋", "🥵", "🌚", "😒", "nice", "ok"],
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator, userConfig }) => {
  try {
    if (!isCreator) {
      return; // Simply return without any response if not owner
    }

    // Quoted message check using Baileys structure
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a view once message!*"
      }, { quoted: message });
    }

    // Extract actual message from View-Once wrappers
    const voWrappers = ['viewOnceMessageV2', 'viewOnceMessageV2Extension', 'viewOnceMessage'];
    let actualMsg = null;
    for (const wrapper of voWrappers) {
      if (quoted[wrapper]?.message) {
        actualMsg = quoted[wrapper].message;
        break;
      }
    }

    if (!actualMsg) {
      const directType = getContentType(quoted);
      if (directType === 'imageMessage' || directType === 'videoMessage' || directType === 'audioMessage') {
        actualMsg = quoted;
      }
    }

    if (!actualMsg) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a valid view once message!*"
      }, { quoted: message });
    }

    const mtype = getContentType(actualMsg);
    const mediaData = actualMsg[mtype];

    if (!mediaData) {
      return await client.sendMessage(from, {
        text: "❌ No media found in this message"
      }, { quoted: message });
    }

    // Download media using standard Baileys method
    const stream = await downloadContentFromMessage(mediaData, mtype.replace('Message', ''));
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const originalCaption = mediaData.caption || '';
    const options = { quoted: message };

    // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
    const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION;

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : `> ${DESCRIPTION}`,
          mimetype: mediaData.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : `> ${DESCRIPTION}`,
          mimetype: mediaData.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: mediaData.ptt || false
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    // Forward to user's DM
    await client.sendMessage(message.sender, messageContent, options);
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + error.message
    }, { quoted: message });
  }
});
