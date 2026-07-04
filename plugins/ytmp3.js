const axios = require("axios");
const yts = require("yt-search");
const { cmd } = require("../zaidi");
const config = require("../config");

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
        
        // ============ CHECK QUERY ============
        if (!query) {
            return reply(`╭─❖ *🎵 PLAY ENGINE* ❖─⬣
│
│  ✧ *Usage:* .play <song name>
│  ✧ *Example:* .play Pal Pal Dil Ke Paas
│  ✧ *Aliases:* song, music, ytmp3
│
╰───────────────⬣
> 🔥 ZAIDI-MD`);
        }

        // ============ SEARCHING REACTION ============
        await conn.sendMessage(from, { 
            react: { text: "🔍", key: m.key } 
        });

        // ============ SEARCH YOUTUBE ============
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
│  💡 Try:
│  • Different keywords
│  • Artist name + song
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

        // ============ CHECK DOWNLOAD URL ============
        if (!downloadUrl) {
            await conn.sendMessage(from, { 
                react: { text: "⚠️", key: m.key } 
            });
            return reply(`╭─❖ *⚠️ DOWNLOAD FAILED* ❖─⬣
│
│  ✧ Could not fetch audio
│  ✧ Try again or use different song
│
╰───────────────⬣`);
        }

        // ============ BEAUTIFUL DESIGN WITH MENTION ============
        const caption = `╭─❖ *🎵 SONG FOUND* ❖─⬣
│
│  ✧ *Title:* ${songTitle}
│  ✧ *Artist:* ${author}
│  ✧ *Duration:* ${duration}
│  ✧ *Views:* ${views}
│  ✧ *Requested By:* @${sender.split("@")[0]}
│
╰───────────────⬣
> 🎶 Enjoy the music!`;

        // ============ SEND THUMBNAIL WITH CAPTION ============
        if (thumbnail) {
            await conn.sendMessage(from, {
                image: { url: thumbnail },
                caption: caption,
                mentions: [sender]
            });
        } else {
            await reply(caption);
        }

        // ============ DOWNLOADING REACTION ============
        await conn.sendMessage(from, { 
            react: { text: "⏳", key: m.key } 
        });

        // ============ SEND AUDIO ============
        const fileName = `${songTitle.replace(/[^\w\s\-]/g, '')}.mp3`;
        
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: fileName
        });

        // ============ SUCCESS REACTION ============
        await conn.sendMessage(from, { 
            react: { text: "✅", key: m.key } 
        });

        // ============ SUCCESS MESSAGE ============
        await reply(`╭─❖ *✅ DOWNLOADED* ❖─⬣
│
│  ✧ *Song:* ${songTitle}
│  ✧ *Artist:* ${author}
│  ✧ *Duration:* ${duration}
│
╰───────────────⬣
> 🎵 ZAIDI-MD`);

    } catch (err) {
        console.error("PLAY ERROR:", err);
        await conn.sendMessage(from, { 
            react: { text: "❌", key: m.key } 
        });
        return reply(`╭─❖ *❌ ERROR* ❖─⬣
│
│  ✧ Something went wrong!
│  ✧ Please try again later
│
╰───────────────⬣
> 🔧 ZAIDI-MD`);
    }
});

// ============ FORMAT VIEWS FUNCTION ============
function formatViews(views) {
    if (!views) return "N/A";
    const num = parseInt(views);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
}
