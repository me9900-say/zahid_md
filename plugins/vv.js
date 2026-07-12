const { cmd } = require("../zaidi");
const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');

cmd({
  pattern: "view",
  fromMe: false,
  desc: "Bypass view-once media (download & re-upload)",
  react: "📤",
  filename: __filename
}, async (client, mek, m, { reply, sender, from }) => {

  try {
    // Quoted message check
    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return;

    // Sare viewonce wrappers try karo
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

    if (!actualMsg) return;

    const mediaType = getContentType(actualMsg);
    const mediaData = actualMsg[mediaType];

    if (!mediaData) return;

    // 1. ڈاؤن لوڈ شروع ہونے پر ری ایکٹ کریں (Uploading/Downloading icon)
    await client.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    // Download media
    const stream = await downloadContentFromMessage(mediaData, mediaType.replace('Message', ''));
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // صرف اوریجنل کیپشن (کوئی اضافی ٹیکسٹ نہیں)
    const caption = mediaData.caption || '';
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
      return;
    }

    // 2. پرانا ری ایکشن ہٹانے کے لیے خالی ٹیکسٹ بھیجیں
    await client.sendMessage(from, { react: { text: "", key: mek.key } });
    
    // 3. کامیابی سے سینڈ ہونے پر ٹک مارک کا ری ایکشن
    await client.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (err) {
    console.error('[VIEWONCE ERROR]', err.message);
    // ایرر کی صورت میں ری ایکشن ہٹا دیں
    await client.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
