const { cmd } = require('../zaidi');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const { exec } = require('child_process');

const delay = (time) => new Promise(res => setTimeout(res, time));

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
        if (mods[i] == 0x45 && mods[i + 1] == 0x58 && mods[i + 2] == 0x49 && mods[i + 3] == 0x46) break;
        i++;
    }
    if (i === length) {
        const head = webpBuffer.subarray(0, 12);
        const tail = webpBuffer.subarray(12);
        const chunk = Buffer.from([0x45, 0x58, 0x49, 0x46]);
        const size = Buffer.alloc(4);
        size.writeUInt32LE(exif.length, 0);
        return Buffer.concat([head, chunk, size, exif, tail]);
    }
    return webpBuffer;
}

cmd({
    pattern: "tgstk",
    alias: ["telegram", "tgsticker"],
    react: "📦",
    desc: "Download stickers from Telegram Pack (Max 20)",
    category: "sticker",
    use: ".tgstk <telegram sticker URL>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) {
            await conn.sendMessage(from, { react: { text: "⚠️", key: m.key } });
            return reply("⚠️ *Please enter the Telegram sticker URL!*\n\n*Example:* `.tgstk https://t.me/addstickers/Porcientoreal`");
        }

        if (!args[0].match(/(https:\/\/t.me\/addstickers\/)/gi)) {
            await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
            return reply("❌ *Invalid URL! Make sure it's a valid Telegram sticker pack link.*");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        const packName = args[0].replace("https://t.me/addstickers/", "");
        const botToken = '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4';

        // ٹیلی گرام API سے اسٹیکر سیٹ کی معلومات حاصل کرنا
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`);
        const stickerSet = await response.json();

        if (!stickerSet.ok || !stickerSet.result) {
            return reply("❌ *Sticker pack not found or it's private!*");
        }

        const totalStickers = stickerSet.result.stickers.length;
        
        // سرور کو کریش ہونے اور واٹس ایپ بین ہونے سے بچانے کے لیے لِمیٹ (حفاظتی تدبیر)
        const limit = 20; 
        const downloadLimit = totalStickers > limit ? limit : totalStickers;

        await conn.sendMessage(from, {
            text: `📦 *Found:* ${totalStickers} stickers.\n⏳ *Downloading first ${downloadLimit} stickers to avoid spam/ban...*`,
            quoted: mek
        });

        const tmpDir = tmpdir();
        let successCount = 0;

        for (let i = 0; i < downloadLimit; i++) {
            try {
                const sticker = stickerSet.result.stickers[i];
                const fileId = sticker.file_id;

                // فائل کا پاتھ حاصل کرنا
                const fileInfo = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
                const fileData = await fileInfo.json();

                if (!fileData.ok || !fileData.result.file_path) continue;

                // اسٹیکر بفر ڈاؤن لوڈ کرنا
                const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
                const imageResponse = await fetch(fileUrl);
                const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

                const tempInput = path.join(tmpDir, `tg_in_${Date.now()}_${i}`);
                const tempOutput = path.join(tmpDir, `tg_out_${Date.now()}_${i}.webp`);

                fs.writeFileSync(tempInput, imageBuffer);

                const isAnimated = sticker.is_animated || sticker.is_video;
                const ffmpegCommand = isAnimated
                    ? `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 "${tempOutput}"`
                    : `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 "${tempOutput}"`;

                // FFmpeg کے ذریعے کنورٹ کرنا
                await new Promise((resolve, reject) => {
                    exec(ffmpegCommand, (error) => {
                        if (error) reject(error);
                        else resolve(undefined);
                    });
                });

                let webpBuffer = fs.readFileSync(tempOutput);

                // عارضی فائلیں ڈیلیٹ کرنا
                try {
                    fs.unlinkSync(tempInput);
                    fs.unlinkSync(tempOutput);
                } catch (e) {}

                // اسٹیکر پر بوٹ کا نام (Exif Metadata) لگانا
                const finalSticker = await addExif(webpBuffer, "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪", "ZAIDI TECH");

                // اسٹیکر بھیجنا
                await conn.sendMessage(from, { sticker: finalSticker });
                
                successCount++;
                
                // واٹس ایپ فلڈ کنٹرول (ہر اسٹیکر کے درمیان 1.5 سیکنڈ کا وقفہ)
                await delay(1500);

            } catch (err) {
                console.error(`Error processing sticker ${i}:`, err);
                continue;
            }
        }

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
        reply(`✅ *Successfully sent ${successCount}/${downloadLimit} stickers!*`);

    } catch (error) {
        console.error('TGSTK ERROR:', error);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        reply("❌ *Failed to process Telegram stickers! Please try again later.*");
    }
});
