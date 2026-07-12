const { cmd } = require('../zaidi');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

cmd({
    pattern: "sticker",
    alias: ["s", "stik", "image2sticker"],
    react: "✨",
    desc: "Convert image into a sticker with bot name",
    category: "sticker",
    use: "Reply to an image with .sticker",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    try {
        // یہ چیک کرنے کے لیے کہ میسیج امیج ہے یا امیج پر ریپلائی کیا گیا ہے
        const isImage = m.mtype === 'imageMessage';
        const isQuotedImage = m.mtype === 'extendedTextMessage' && m.msg.contextInfo && m.msg.contextInfo.quotedMessage && m.msg.contextInfo.quotedMessage.imageMessage;

        if (!isImage && !isQuotedImage) {
            return reply("❌ *براہ کرم کسی تصویر پر ریپلائی کریں یا تصویر کے ساتھ .sticker لکھیں!*");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        // میڈیا میسیج کو ٹارگٹ کرنا
        const messageToDownload = isQuotedImage ? m.msg.contextInfo.quotedMessage.imageMessage : m.msg.imageMessage;

        // امیج ڈاؤن لوڈ کر کے بفر بنانا
        const imageBuffer = await downloadMediaMessage(
            { message: { imageMessage: messageToDownload } },
            'buffer',
            {}
        );

        // عارضی (Temporary) فائل پاتھس بنانا
        const inputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + ".jpg");
        const outputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + ".webp");

        // امیج بفر کو عارضی فائل میں لکھنا
        fs.writeFileSync(inputPath, imageBuffer);

        // FFmpeg کے ذریعے تصویر کو واٹس ایپ اسٹیکر سائز (WebP) میں تبدیل کرنا
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .on("error", reject)
                .on("end", () => resolve(true))
                .addOutputOptions([
                    "-vcodec", "libwebp",
                    "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse",
                    "-loop", "0",
                    "-preset", "default",
                    "-an",
                    "-vsync", "0"
                ])
                .toFormat("webp")
                .save(outputPath);
        });

        // تبدیل شدہ اسٹیکر کو پڑھنا
        let stickerBuffer = fs.readFileSync(outputPath);

        // عارضی فائلیں ڈیلیٹ کرنا
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);

        // اسٹیکر بھیجنے کا لاجک مع بوٹ نیم (Pack & Author Metadata)
        await conn.sendMessage(
            from,
            { 
                sticker: stickerBuffer 
            },
            { 
                quoted: mek,
                ephemeralExpiration: m.expiration,
                // یہاں آپ کے بوٹ کا نام اسٹیکر کے ساتھ چپک جائے گا
                packname: "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪", 
                author: "ZAIDI TECH" 
            }
        );

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.log("STICKER CONVERSION ERROR:", e);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        reply("❌ *اسٹیکر بنانے میں کوئی خرابی پیش آئی ہے!*");
    }
});
