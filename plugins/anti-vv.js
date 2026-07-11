const { cmd } = require("../zaidi");
const config = require('../config');

// صرف یہ کی ورڈز بغیر پری فکس کے کام کریں گے
const positiveKeywords = ["nice", "good", "cute", "🌝", "🥵", "💋", "👍", "🌚", "wow", "😩", "super"];

// بغیر پری فکس والا ہینڈلر (صرف اونر کے لیے)
cmd({
  'on': "body",
  'isCmd': false,           // فریم ورک کو بتاتا ہے کہ اس کمانڈ کے لیے پری فکس چیک نہ کرے
  'nonPrefixed': true,      // کچھ فریم ورکس میں یہ پراپرٹی بغیر پری فکس کے چلانے کے لیے استعمال ہوتی ہے
  'dontAddCommandList': true // اسے مینو لسٹ میں شو نہیں کرے گا کیونکہ یہ سیکرٹ ہے
}, async (client, message, store, {
  from,
  body,
  isCreator,
  userConfig
}) => {
  try {
    // 1. سب سے پہلے چیک کریں کہ میسج اونر نے بھیجا ہے اور باڈی موجود ہے
    if (!isCreator || !body) return;

    const rawText = body.trim();
    
    // 2. پری فکس چیک: اگر اونر نے میسج کے شروع میں پری فکس (جیسے . یا !) لگایا ہے،
    // تو یہ کمانڈ کچھ بھی نہیں کرے گی اور یہیں رک جائے گی (تاکہ ڈاٹ نائس پر یہ نہ چلے)
    const prefix = config.PREFIX || '.';
    if (rawText.startsWith(prefix)) return;

    // 3. ٹیکسٹ کو لوئر کیس کریں تاکہ کیس کا مسئلہ نہ ہو (Nice اور nice دونوں ایک برابر ہوں)
    const messageText = rawText.toLowerCase();

    // 4. چیک کریں کہ میسج میں صرف اور صرف وہی کی ورڈ ہے (آگے پیچھے کچھ اور نہ ہو)
    const hasExactKeywordOnly = positiveKeywords.includes(messageText);
    if (!hasExactKeywordOnly) return;

    // 5. ریپلائی اور ویو ونس چیک: کیا یہ کسی ویو ونس میسج کا ریپلائی ہے؟
    const quotedMessage = message.quoted || (message.msg && message.msg.contextInfo && message.msg.contextInfo.quotedMessage);
    if (!quotedMessage) return; 

    const isViewOnce = quotedMessage.viewOnce || 
                       quotedMessage.imageMessage?.viewOnce || 
                       quotedMessage.videoMessage?.viewOnce || 
                       quotedMessage.audioMessage?.viewOnce;

    if (!isViewOnce) return;

    // 6. میڈیا ڈاؤن لوڈ کریں
    const buffer = await message.quoted.download().catch(() => null);
    if (!buffer) return; 

    const mtype = message.quoted.mtype;
    const originalCaption = message.quoted.text || '';
    const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : (DESCRIPTION ? `> ${DESCRIPTION}` : ""),
          mimetype: message.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : (DESCRIPTION ? `> ${DESCRIPTION}` : ""),
          mimetype: message.quoted.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: message.quoted.ptt || false
        };
        break;
      default:
        return; 
    }

    // 7. میڈیا کو صرف اونر کے ان باکس (DM) میں بھیجیں، پبلک چیٹ میں کچھ شو نہیں ہوگا
    await client.sendMessage(message.sender, messageContent);

  } catch (error) {
    // بوٹ ہینگ نہ ہو، اس لیے ایرر صرف ٹرمینل میں دیکھے گا
    console.error("Secret View Once Error:", error);
  }
});
