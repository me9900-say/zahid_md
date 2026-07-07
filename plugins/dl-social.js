// =============================================
// ZAIDI-MD — dl-social.js (FIXED)
// Commands: .ttmp3 .igmp3
// Fix: node-fetch v3 mein .buffer() nahi hota — .arrayBuffer() use karo (Bug #3)
// =============================================

const { cmd } = require("../zaidi");
const fetch = require('node-fetch');
const converter = require('../lib/converter');

// ══════════════════════════════════════════
// .ttmp3 — TikTok se audio extract karo
// ══════════════════════════════════════════
cmd({
    pattern: "ttmp3",
    alias: ["tiktokmp3", "tiktokaudio", "ttaudio"],
    react: "🎵",
    desc: "TikTok video se audio extract karo",
    category: "download",
    use: ".ttmp3 <TikTok URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("tiktok.com")) {
            return reply("❌ TikTok link provide karein\nExample: .ttmp3 https://www.tiktok.com/...");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // ── TikTok API se video URL lo ──
        const apiUrl = `https://api.deline.web.id/downloader/tiktok?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ TikTok video fetch nahi hua. Link check karein.");
        }

        const videoUrl = data.result.download;

        await conn.sendMessage(from, { react: { text: '⬇️', key: mek.key } });

        // ── Video download karo ──
        const videoResponse = await fetch(videoUrl);

        // BUG #3 FIX: node-fetch v3 mein .buffer() kaam nahi karta.
        // Pehle .buffer() likha tha jo crash karta tha:
        //   const videoBuffer = await videoResponse.buffer();  ← GALAT
        // 
        // Fix: .arrayBuffer() use karo aur phir Buffer.from() se convert karo:
        const arrayBuffer = await videoResponse.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);

        await conn.sendMessage(from, { react: { text: '🔧', key: mek.key } });

        // ── MP3 mein convert karo ──
        const audioBuffer = await converter.toAudio(videoBuffer, 'mp4');

        // ── Audio bhejo ──
        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: 'tiktok_audio.mp3'
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error('[ttmp3] Error:', error.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ Audio extract nahi hua. Error: " + error.message);
    }
});


// ══════════════════════════════════════════
// .igmp3 — Instagram video se audio extract karo
// ══════════════════════════════════════════
cmd({
    pattern: "igmp3",
    alias: ["instamp3", "instaaudio", "igaudio"],
    react: "🎵",
    desc: "Instagram video/reel se audio extract karo",
    category: "download",
    use: ".igmp3 <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("instagram.com")) {
            return reply("❌ Instagram link provide karein\nExample: .igmp3 https://www.instagram.com/reel/...");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // ── Instagram API se video lo ──
        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data?.status || !data.data?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ Instagram media fetch nahi hua. Private content ya invalid link.");
        }

        const videoItem = data.data.find(item => item.type === 'video');
        if (!videoItem) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ Is post mein koi video nahi mili.");
        }

        await conn.sendMessage(from, { react: { text: '⬇️', key: mek.key } });

        // ── Video download karo ──
        const videoResponse = await fetch(videoItem.url);

        // BUG #3 FIX: node-fetch v3 mein .buffer() nahi hota.
        // Yahi wajah thi ke igmp3 crash karta tha.
        // .arrayBuffer() aur Buffer.from() use karo:
        const arrayBuffer = await videoResponse.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);

        await conn.sendMessage(from, { react: { text: '🔧', key: mek.key } });

        // ── MP3 mein convert karo ──
        const audioBuffer = await converter.toAudio(videoBuffer, 'mp4');

        // ── Audio bhejo ──
        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: 'instagram_audio.mp3'
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error('[igmp3] Error:', error.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ Audio extract nahi hua. Error: " + error.message);
    }
});
