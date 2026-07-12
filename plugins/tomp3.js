const { cmd } = require('../zaidi');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const { exec } = require('child_process');

// ==========================================
// 1. VIDEO TO MP3 COMMAND (.tomp3)
// ==========================================
cmd({
    pattern: "tomp3",
    alias: ["mp3", "toaudio"],
    react: "🎵",
    desc: "Convert any video into MP3 audio format",
    category: "convert",
    use: "Reply to a video with .tomp3",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // یہ چیک کرنے کے لیے کہ کیا ویڈیو پر ریپلائی کیا گیا ہے یا ڈائریکٹ ویڈیو ہے
        const isVideo = m.mtype === 'videoMessage';
        const isQuotedVideo = m.mtype === 'extendedTextMessage' && m.msg.contextInfo && m.msg.contextInfo.quotedMessage && m.msg.contextInfo.quotedMessage.videoMessage;

        if (!isVideo && !isQuotedVideo) {
            await conn.sendMessage(from, { react: { text: "⚠️", key: m.key } });
            return reply("❌ *براہ کرم کسی ویڈیو پر ریپلائی کر کے .tomp3 لکھیں!*");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
        
        // سمپل لوڈنگ ٹیکسٹ
        await conn.sendMessage(from, { text: "⏳ *Converting video to MP3 audio...*", quoted: mek });

        const messageToDownload = isQuotedVideo ? m.msg.contextInfo.quotedMessage.videoMessage : m.msg.videoMessage;
        const videoBuffer = await downloadMediaMessage({ message: { videoMessage: messageToDownload } }, 'buffer', {});

        const inputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + ".mp4");
        const outputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + ".mp3");

        fs.writeFileSync(inputPath, videoBuffer);

        // FFmpeg کے ذریعے ویڈیو سے آڈیو نکالنا (MP3 فارمیٹ میں)
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i "${inputPath}" -vn -ar 44100 -ac 2 -b:a 192k "${outputPath}"`, (error) => {
                if (error) reject(error);
                else resolve(undefined);
            });
        });

        const mp3Buffer = fs.readFileSync(outputPath);

        // عارضی فائلیں ڈیلیٹ کرنا
        try { fs.unlinkSync(inputPath); fs.unlinkSync(outputPath); } catch (e) {}

        // آڈیو فائل بھیجنا
        await conn.sendMessage(from, {
            audio: mp3Buffer,
            mimetype: 'audio/mp4', // واٹس ایپ پر آڈیو فائل کے لیے
            ptt: false
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.log("TOMP3 ERROR:", e);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        reply("❌ *ویڈیو کو آڈیو میں تبدیل کرنے میں خرابی آئی!*");
    }
});


// ==========================================
// 2. TO PTT (VOICE NOTE) COMMAND (.toptt)
// ==========================================
cmd({
    pattern: "toptt",
    alias: ["ptt", "tovn", "vn"],
    react: "🎙️",
    desc: "Convert any audio or video into a WhatsApp Voice Note (PTT)",
    category: "convert",
    use: "Reply to an audio/video with .toptt",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // یہ چیک کرنے کے لیے کہ کیا آڈیو یا ویڈیو پر ریپلائی کیا گیا ہے
        const isQuotedAudio = m.mtype === 'extendedTextMessage' && m.msg.contextInfo && m.msg.contextInfo.quotedMessage && m.msg.contextInfo.quotedMessage.audioMessage;
        const isQuotedVideo = m.mtype === 'extendedTextMessage' && m.msg.contextInfo && m.msg.contextInfo.quotedMessage && m.msg.contextInfo.quotedMessage.videoMessage;
        const isVideo = m.mtype === 'videoMessage';
        const isAudio = m.mtype === 'audioMessage';

        if (!isQuotedAudio && !isQuotedVideo && !isVideo && !isAudio) {
            await conn.sendMessage(from, { react: { text: "⚠️", key: m.key } });
            return reply("❌ *براہ کرم کسی آڈیو یا ویڈیو پر ریپلائی کر کے .toptt لکھیں!*");
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
        await conn.sendMessage(from, { text: "⏳ *Converting to voice note (PTT)...*", quoted: mek });

        let messageToDownload;
        let ext = ".mp3"; // ڈیفالٹ ایکسٹینشن

        if (isQuotedAudio || isAudio) {
            messageToDownload = isQuotedAudio ? m.msg.contextInfo.quotedMessage.audioMessage : m.msg.audioMessage;
            ext = ".mp3";
        } else {
            messageToDownload = isQuotedVideo ? m.msg.contextInfo.quotedMessage.videoMessage : m.msg.videoMessage;
            ext = ".mp4";
        }

        // میڈیا ڈاؤن لوڈ کرنا
        const mediaBuffer = await downloadMediaMessage(
            { message: isQuotedAudio || isAudio ? { audioMessage: messageToDownload } : { videoMessage: messageToDownload } },
            'buffer',
            {}
        );

        const inputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + ext);
        const outputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + ".opus");

        fs.writeFileSync(inputPath, mediaBuffer);

        // FFmpeg کے ذریعے آڈیو/ویڈیو کو واٹس ایپ کے آفیشل وائس نوٹ فارمیٹ (libopus) میں تبدیل کرنا
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i "${inputPath}" -vn -c:a libopus -b:a 64k -vbr on "${outputPath}"`, (error) => {
                if (error) reject(error);
                else resolve(undefined);
            });
        });

        const pttBuffer = fs.readFileSync(outputPath);

        // عارضی فائلیں کلین کرنا
        try { fs.unlinkSync(inputPath); fs.unlinkSync(outputPath); } catch (e) {}

        // وائس نوٹ (PTT) بھیجنا
        await conn.sendMessage(from, {
            audio: pttBuffer,
            mimetype: 'audio/ogg; codecs=opus', // وائس نوٹ کے لیے لازمی ہے
            ptt: true // اس سے یہ آڈیو فائل کے بجائے ریکارڈڈ وائس نوٹ شو ہوگا
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.log("TOPTT ERROR:", e);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        reply("❌ *وائس نوٹ میں تبدیل کرنے میں کوئی خرابی پیش آئی ہے!*");
    }
});
