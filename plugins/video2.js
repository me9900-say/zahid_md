const axios = require("axios");
const yts = require("yt-search");
const { cmd } = require("../zaidi");
const { fakevCard } = require("../lib/fakevCard");

cmd({
    pattern: "video2",
    alias: ["vdo2", "playvideo2"],
    react: "🎬",
    desc: "Download YouTube video in MP4 format using David Cyril API",
    category: "downloader",
    use: ".video2 <video name or link>",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, botNumber, sender }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            const noQueryLayout = `*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰🎬 𝐕𝐈𝐃𝐄𝐎 𝐏𝐋𝐀𝐘𝐄Ｒ 𝟐 ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│* ❌ Please Provide A Video Name Or Link
*│* 💡 Use: .video2 <video name or link>
*│* 📝 Ex: .video2 headlights
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*`;
            return conn.sendMessage(from, { text: noQueryLayout }, { quoted: fakevCard });
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        let videoUrl = query;

        // Agar user ne name likha hai link nahi, to pehle link search karega
        if (!query.startsWith("http://") && !query.startsWith("https://")) {
            const search = await yts(query);
            if (!search.videos || !search.videos.length) {
                await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
                return conn.sendMessage(from, { text: 
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ No results found for your query!
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*` 
                }, { quoted: fakevCard });
            }
            videoUrl = search.videos[0].url;
        }

        let downloadUrl = "";
        let videoTitle = "Unknown";
        let videoQuality = "Unknown";
        let videoDuration = "Unknown";
        let videoThumbnail = "";

        /* 🚀 Fetch Video Link from David Cyril API */
        try {
            const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}&apikey=`;
            const { data } = await axios.get(apiUrl);

            if (data && data.result && data.result.download_url) {
                downloadUrl = data.result.download_url;
                videoTitle = data.result.title || "Unknown";
                videoQuality = data.result.quality || "Unknown";
                videoDuration = data.result.duration ? data.result.duration + "s" : "Unknown";
                videoThumbnail = data.result.thumbnail || "";
            }
        } catch (apiErr) {
            console.error('[video2] David Cyril API error:', apiErr.message);
        }

        if (!downloadUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
            return conn.sendMessage(from, { text: 
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ Video link could not be fetched from David Cyril API.
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*` 
            }, { quoted: fakevCard });
        }

        // 📝 Custom Box Design with Mentions
        const videoCaption = `*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰🎬 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│* 🎥 Title: ${videoTitle}
*│* 🎚️ Quality: ${videoQuality}
*│* ⏱️ Duration: ${videoDuration}
*│* 👥 Requested By: @${sender.split("@")[0]}
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*`;

        /* 🖼️ 1. Image + Caption Send */
        let sentInfo;
        if (videoThumbnail) {
            sentInfo = await conn.sendMessage(from, {
                image: { url: videoThumbnail },
                caption: videoCaption,
                mentions: [sender]
            }, { quoted: fakevCard });
        } else {
            sentInfo = await conn.sendMessage(from, {
                text: videoCaption,
                mentions: [sender]
            }, { quoted: fakevCard });
        }

        /* 🎥 2. MP4 Video Send */
        await conn.sendMessage(from, {
            video: { url: downloadUrl }, 
            mimetype: "video/mp4",
            caption: `*🎬 ${videoTitle}*\n\n> _ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪_`,
            upload: conn.waUploadToServer
        }, { quoted: sentInfo }); 

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("VIDEO2 ERROR:", err);
        conn.sendMessage(from, { text: 
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ An error occurred while processing the video.
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*` 
        }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    }
});
