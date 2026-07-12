const { cmd } = require('../zaidi');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

cmd({
    pattern: "s2img",
    alias: ["simage", "stoimg", "toimage"],
    react: "🖼️",
    desc: "Convert a sticker back into an image",
    category: "convert",
    use: "Reply to a sticker with .s2img",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    try {
        // یہ چیک کرنے کے لیے کہ کیا کسی اسٹیکر پر ریپلائی کیا گیا ہے
        const isQuotedSticker = m.mtype === 'extendedTextMessage' && m.msg.contextInfo && m.msg.contextInfo.quotedMessage && m.msg.contextInfo.quotedMessage.stickerMessage;

        if (!isQuotedSticker) {
            await conn.sendMessage(from, { react: { text: "⚠️", key: m.key } });
            return reply("❌ *براہ کرم کسی اسٹیکر پر ریپلائی کر کے .s2img لکھیں!*");
        }

        // کام شروع ہونے کا ری ایکشن (React)
        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        // فالتو ڈیزائننگ کے بغیر بالکل سمپل لوڈنگ ٹیکسٹ
        await conn.sendMessage(from, {
            text: "⏳ *Converting sticker to image...*",
            quoted: mek
        });

        // ریپلائی کیے گئے اسٹیکر میسیج کو ٹارگٹ کرنا
        const stickerMessage = m.msg.contextInfo.quotedMessage.stickerMessage;

        // اسٹیکر کو بفر (Buffer) میں ڈاؤن لوڈ کرنے کا لاجک
        const stickerBuffer = await downloadMediaMessage(
            { message: { stickerMessage: stickerMessage } },
            'buffer',
            {}
        );

        // واٹس ایپ کو پتا ہے کہ اسٹیکر ایک امیج فائل ہی ہوتی ہے،
        // اس لیے ڈاؤن لوڈ کردہ بفر کو براہ راست بطور امیج سینڈ کر دیں گے
        await conn.sendMessage(
            from,
            { 
                image: stickerBuffer, 
                caption: "✨ *Here is your converted image!*\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪" 
            },
            { quoted: mek }
        );

        // کامیابی کا ری ایکشن
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.log("S2IMG ERROR:", e);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        reply("❌ *اسٹیکر کو امیج میں تبدیل کرنے میں خرابی پیش آئی ہے!*");
    }
});
