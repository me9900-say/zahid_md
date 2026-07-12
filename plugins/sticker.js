const { cmd } = require('../zaidi');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

// اسٹیکر میں نام (Metadata) داخل کرنے کا بائنری فنکشن
async function addExif(webpBuffer, packname, author) {
    const json = {
        "sticker-pack-id": `zaidi-md-${Crypto.randomBytes(4).toString('hex')}`,
        "sticker-pack-name": packname || "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪",
        "sticker-pack-publisher": author || "ZAIDI TECH",
        "emojis": ["✨"]
    };
    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
    const exif = Buffer.concat([exifAttr, jsonBuff]);
    exif.writeUIntle(jsonBuff.length, 14, 4);
    
    const mods = new Uint8Array(webpBuffer);
    const length = mods.length;
    let i = 0;
    
    while (i < length) {
        if (mods[i] == 0x45 && mods[i + 1] == 0x58 && mods[i + 2] == 0x49 && mods[i + 3] == 0x46) {
            break;
        }
        i++;
    }
    
    if (i === length) {
        // اگر پہلے سے Exif نہیں ہے تو نیا ایڈ کرو
        const head = webpBuffer.subarray(0, 12);
        const tail = webpBuffer.subarray(12);
        const chunk = Buffer.from([0x45, 0x58, 0x49, 0x46]);
        const size = Buffer.alloc(4);
        size.writeUInt32LE(exif.length, 0);
        return Buffer.concat([head, chunk, size, exif, tail]);
    } else {
        return webpBuffer;
    }
}

// ==========================================
// 1. IMAGE TO STICKER COMMAND (With Fixed Name)
// ==========================================
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
        const isImage = m.mtype === 'imageMessage';
        const isQuotedImage = m.mtype === 'extendedTextMessage' && m.msg.contextInfo && m.msg.contextInfo.quotedMessage && m.msg.contextInfo.quotedMessage.imageMessage;

        if (!isImage && !isQuotedImage) {
            return reply("❌ *براہ کرم کسی تصویر پر ریپلائی کریں یا تصویر کے ساتھ .sticker لکھیں!*");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const messageToDownload = isQuotedImage ? m.msg.contextInfo.quotedMessage.imageMessage : m.msg.imageMessage;
        const imageBuffer = await downloadMediaMessage({ message: { imageMessage: messageToDownload } }, 'buffer', {});

        const inputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + ".jpg");
        const outputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + ".webp");

        fs.writeFileSync(inputPath, imageBuffer);

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

        let webpBuffer = fs.readFileSync(outputPath);
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);

        // یہاں فکسڈ نام ایڈ ہو رہا ہے
        const finalSticker = await addExif(webpBuffer, "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪", "ZAIDI TECH");

        await conn.sendMessage(from, { sticker: finalSticker }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.log("STICKER ERROR:", e);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        reply("❌ *اسٹیکر بنانے میں خرابی آئی!*");
    }
});


// ==========================================
// 2. TAKE STICKER COMMAND (Change Sticker Name)
// ==========================================
cmd({
    pattern: "take",
    alias: ["wm", "steal", "packname"],
    react: "📝",
    desc: "Change any sticker's pack name and author name",
    category: "sticker",
    use: ".take PackName | AuthorName",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        // چیک کریں کہ کیا کسی اسٹیکر پر ریپلائی کیا گیا ہے
        const isQuotedSticker = m.mtype === 'extendedTextMessage' && m.msg.contextInfo && m.msg.contextInfo.quotedMessage && m.msg.contextInfo.quotedMessage.stickerMessage;

        if (!isQuotedSticker) {
            return reply("❌ *براہ کرم کسی اسٹیکر پر ریپلائی کر کے .take لکھیں!*");
        }

        // نام الگ کرنا (اگر صارف نے | لگایا ہو تو پیک نیم اور اتھر الگ ہوں گے، ورنہ پورا ٹیکسٹ پیک نیم بن جائے گا)
        let text = args.join(" ");
        let packName = "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪"; // ڈیفالٹ اگر کچھ نہ لکھا ہو
        let authorName = "ZAIDI TECH";

        if (text) {
            if (text.includes("|")) {
                const splitText = text.split("|");
                packName = splitText[0].trim();
                authorName = splitText[1].trim();
            } else {
                packName = text.trim();
                authorName = "ZAIDI TECH";
            }
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        // اسٹیکر میسیج کو ڈاؤن لوڈ کرنا
        const stickerMessage = m.msg.contextInfo.quotedMessage.stickerMessage;
        const stickerBuffer = await downloadMediaMessage({ message: { stickerMessage: stickerMessage } }, 'buffer', {});

        // نئے نام کے ساتھ Exif ایڈ کرنا
        const renamedSticker = await addExif(stickerBuffer, packName, authorName);

        // دوبارہ اسٹیکر بھیجنا
        await conn.sendMessage(from, { sticker: renamedSticker }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.log("TAKE ERROR:", e);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        reply("❌ *اسٹیکر کا نام تبدیل کرنے میں خرابی آئی!*");
    }
});
