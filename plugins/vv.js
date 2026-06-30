

const { cmd } = require("../zaidi");
const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');

cmd({
  pattern: "view",
  fromMe: false,
  desc: "Bypass view-once media (download & re-upload)",
  react: "📤",
  filename: __filename
}, async (client, mek, m, { reply, sender, from }) => {

  const sendReply = async (text) => {
    await client.sendMessage(from, { text }, { quoted: mek });
  };

  try {
    // Quoted message check
    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return sendReply(`❌ Please reply to a view-once media message`);
    }

    // ✅ Sare viewonce wrappers try karo
    const voWrappers = [
      'viewOnceMessageV2',
      'viewOnceMessageV2Extension',
      'viewOnceMessage',
    ];

    let actualMsg = null;
    for (const wrapper of voWrappers) {
      if (quoted[wrapper]?.message) {
        actualMsg = quoted[wrapper].message;
        break;
      }
    }

    // Direct unwrapped check
    if (!actualMsg) {
      const directType = getContentType(quoted);
      if (directType === 'imageMessage' || directType === 'videoMessage' || directType === 'audioMessage') {
        actualMsg = quoted;
      }
    }

    if (!actualMsg) {
      return sendReply(`❌ This is not a view-once message`);
    }

    const mediaType = getContentType(actualMsg);
    const mediaData = actualMsg[mediaType];

    if (!mediaData) {
      return sendReply(`❌ No media found in this message`);
    }

    await reply(`⏳ Downloading view-once media...`);

    // Download media
    const stream = await downloadContentFromMessage(mediaData, mediaType.replace('Message', ''));
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // Caption with footer
    const caption = `${mediaData.caption || ''}\n\n> ✅ View-Once Bypassed`.trim();
    const mentions = mediaData.contextInfo?.mentionedJid || [];

    // Send based on media type
    if (mediaType === 'imageMessage') {
      await client.sendMessage(sender, { 
        image: buffer, 
        caption, 
        mentions 
      });
    } else if (mediaType === 'videoMessage') {
      await client.sendMessage(sender, { 
        video: buffer, 
        caption, 
        mimetype: 'video/mp4', 
        mentions 
      });
    } else if (mediaType === 'audioMessage') {
      await client.sendMessage(sender, { 
        audio: buffer, 
        mimetype: 'audio/mp4', 
        ptt: true 
      });
    } else {
      return sendReply(`❌ Unsupported media type: ${mediaType}`);
    }

    await reply(`✅ View-once media forwarded successfully!`);

  } catch (err) {
    console.error('[VIEWONCE ERROR]', err.message);
    return sendReply(`❌ Failed to bypass: ${err.message}`);
  }
});
