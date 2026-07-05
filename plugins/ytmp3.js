const axios = require("axios");
const yts = require("yt-search");
const { cmd } = require("../zaidi");

cmd({
    pattern: "play",
    alias: ["song", "ytmp3", "music", "audio", "gana"],
    react: "🎵",
    desc: "YouTube search & MP3 download with beautiful design",
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
│  ✧ *Aliases:* song, music, ytmp3
│
╰───────────────⬣
> 🔥 ZAIDI-MD`);
        }

        await conn.sendMessage(from, { 
            react: { text: "🔍", key: m.key } 
        });

        const search = await yts(query);
        if (!search.videos || !search.videos.length) {
            await conn.sendMessage(from, { 
                react: { text: "❌", key: m.key } 
            });
            return reply(`╭─❖ *🔎 NO RESULTS* ❖─⬣
│
│  ✧ No matches found for:
│  ✧ *"${query}"*
│
│  💡 Try different keywords
│
╰───────────────⬣`);
        }

        const video = search.videos[0];
        let downloadUrl = "";
        let songTitle = video.title || "Unknown Song";
        let thumbnail = video.thumbnail || "";
        let duration = video.timestamp || "N/A";
        let author = video.author?.name || "Unknown Artist";
        let views = video.views ? formatViews(video.views) : "N/A";

        // ============ FETCH AUDIO FROM API ============
        try {
            const apiResponse = await axios.get(
                `https://faizan-api.vercel.app/api/ytdown?url=${encodeURIComponent(video.url)}&format=mp3`,
                { timeout: 30000 }
            );
            
            if (apiResponse.data && apiResponse.data.downloadURL) {
                downloadUrl = apiResponse.data.downloadURL;
                songTitle = apiResponse.data.title || video.title;
                thumbnail = apiResponse.data.thumbnail || video.thumbnail;
            }
        } catch (apiErr) {
            console.error('[PLAY] API Error:', apiErr.message);
        }

        if (!downloadUrl) {
            await conn.sendMessage(from, { 
                react: { text: "⚠️", key: m.key } 
            });
            return reply(`╭─❖ *⚠️ DOWNLOAD FAILED* ❖─⬣
│
│  ✧ Could not fetch audio
│  ✧ Try again later
│
╰───────────────⬣`);
        }

        // ============ CAPTION WITH MENTION ============
        const caption = `╭─❖ *🎵 SONG FOUND* ❖─⬣
│
│  ✧ *Title:* ${songTitle}
│  ✧ *Artist:* ${author}
│  ✧ *Duration:* ${duration}
│  ✧ *Views:* ${views}
│  ✧ *Requested By:* @${sender.split("@")[0]}
│
╰───────────────⬣
> 🎶 Downloading audio...`;

        // ============ SEND THUMBNAIL ============
        const thumbnailMsg = await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: caption,
            mentions: [sender]
        });

        await conn.sendMessage(from, { 
            react: { text: "⏳", key: m.key } 
        });

        // ============ SEND AUDIO WITH PROPER FORMAT ============
        const fileName = `${songTitle.replace(/[^\w\s\-]/g, '')}.mp3`;
        
        // 🔥 FIX: Audio ko properly format karke bhejna
        await conn.sendMessage(from, {
            audio: { 
                url: downloadUrl,
                // Force download and convert
                mimetype: 'audio/mpeg',
                fileName: fileName
            },
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: fileName
        }, { 
            quoted: thumbnailMsg,
            // Ensure proper audio format
            audio: true
        });

        await conn.sendMessage(from, { 
            react: { text: "✅", key: m.key } 
        });

    } catch (err) {
        console.error("PLAY ERROR:", err);
        await conn.sendMessage(from, { 
            react: { text: "❌", key: m.key } 
        });
        return reply(`╭─❖ *❌ ERROR* ❖─⬣
│
│  ✧ ${err.message?.slice(0, 50) || 'Something went wrong!'}
│
╰───────────────⬣`);
    }
});

function formatViews(views) {
    if (!views) return "N/A";
    const num = parseInt(views);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
}
