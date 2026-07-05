const axios = require("axios");
const yts = require("yt-search");
const { cmd } = require("../zaidi");
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "play",
    alias: ["song", "ytmp3", "music", "audio", "gana"],
    react: "🎵",
    desc: "YouTube search & MP3 download",
    category: "downloader",
    use: ".play <song name>",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    try {
        const query = args.join(" ");
        
        if (!query) {
            return reply(`╭─❖ *🎵 PLAY ENGINE* ❖─⬣
│
│  ✧ *Usage:* .play <song name>
│  ✧ *Example:* .play headlights
│
╰───────────────⬣`);
        }

        await conn.sendMessage(from, { react: { text: "🔍", key: m.key } });

        const search = await yts(query);
        if (!search.videos || !search.videos.length) {
            await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
            return reply(`❌ No results found for: ${query}`);
        }

        const video = search.videos[0];
        
        // Download audio as buffer
        const apiResponse = await axios.get(
            `https://faizan-api.vercel.app/api/ytdown?url=${encodeURIComponent(video.url)}&format=mp3`,
            { timeout: 30000 }
        );
        
        if (!apiResponse.data?.downloadURL) {
            return reply('❌ Download failed!');
        }

        // Download the audio file as buffer
        const audioResponse = await axios.get(apiResponse.data.downloadURL, {
            responseType: 'arraybuffer'
        });

        const caption = `╭─❖ *🎵 SONG FOUND* ❖─⬣
│
│  ✧ *Title:* ${video.title}
│  ✧ *Artist:* ${video.author?.name || 'Unknown'}
│  ✧ *Duration:* ${video.timestamp || 'N/A'}
│  ✧ *Requested By:* @${sender.split("@")[0]}
│
╰───────────────⬣`;

        // Send thumbnail
        const thumbnailMsg = await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: caption,
            mentions: [sender]
        });

        // Send audio as buffer
        await conn.sendMessage(from, {
            audio: Buffer.from(audioResponse.data),
            mimetype: 'audio/mpeg',
            fileName: `${video.title.replace(/[^\w\s\-]/g, '')}.mp3`,
            ptt: false
        }, { quoted: thumbnailMsg });

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("PLAY ERROR:", err);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        return reply(`❌ Error: ${err.message?.slice(0, 50) || 'Something went wrong!'}`);
    }
});
