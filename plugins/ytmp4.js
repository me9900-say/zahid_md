const axios = require("axios");
const yts = require("yt-search");
const { cmd } = require("../zaidi");
const { fakevCard } = require("../lib/fakevCard");

cmd({
    pattern: "video",
    alias: ["ytmp4", "playvideo", "mp4", "vdo"],
    react: "🎥",
    desc: "YouTube search & MP4 video play (Updated API with Quality Auto-Fallback)",
    category: "download",
    use: ".video <video name>",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, botNumber, sender }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            const noQueryLayout = `*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰🎥 𝐕𝐈𝐃𝐄𝐎 𝐏𝐋𝐀𝐘𝐄Ｒ ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│* ❌ Please Provide A Video Name Or Link
*│* 💡 Use: .video <video name>
*│* 📝 Ex: .video headlights
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*`;
            return conn.sendMessage(from, { text: noQueryLayout }, { quoted: fakevCard });
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

        /* 🔍 Search YouTube */
        const search = await yts(query);
        if (!search.videos || !search.videos.length) {
            await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
            return conn.sendMessage(from, { text: 
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ No results found for your query!
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*` 
            }, { quoted: fakevCard });
        }

        const video = search.videos[0];
        let downloadUrl = "";
        let videoTitle = video.title;

        /* 🚀 Fetch Video Link from New Hector Manuel API */
        try {
            const res = await axios.get(
                `https://yt-dl.officialhectormanuel.workers.dev/stream?id=${video.videoId}`,
                { timeout: 25000 }
            );
            
            if (res.data && res.data.status) {
                videoTitle = res.data.title || video.title;
                const videosObj = res.data.videos;

                if (videosObj) {
                    // Pehle 450 quality check karega, agar nahi mili to baqi backup qualities check karega
                    downloadUrl = videosObj["450"] || videosObj["338"] || videosObj["224"] || videosObj["136"] || Object.values(videosObj)[0];
                }
            }
        } catch (apiErr) {
            console.error('[video] New API error:', apiErr.message);
        }

        // Agar specific workers api crash ho ya link na mile, to direct response handle hoga
        if (!downloadUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
            return conn.sendMessage(from, { text: 
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ Video link could not be fetched from API.
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*` 
            }, { quoted: fakevCard });
        }

        // 📝 Custom Box Design with Mentions
        const videoCaption = `*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰🎥 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│* 🎥 Title: ${videoTitle}
*│* ⏱️ Duration: ${video.timestamp || "Unknown"}
*│* 👥 Requested By: @${sender.split("@")[0]}
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*`;

        /* 🖼️ 1. Image + Caption Send */
        const sentInfo = await conn.sendMessage(from, {
            image: { url: video.thumbnail || res.data.thumbnail },
            caption: videoCaption,
            mentions: [sender]
        }, { quoted: fakevCard });

        /* 🎥 2. MP4 Video Send */
        await conn.sendMessage(from, {
            video: { url: downloadUrl }, 
            mimetype: "video/mp4",
            caption: `*🎬 ${videoTitle}*`,
            upload: conn.waUploadToServer
        }, { quoted: sentInfo }); 

        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("VIDEO ERROR:", err);
        conn.sendMessage(from, { text: 
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ An error occurred while processing the video.
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*` 
        }, { quoted: fakevCard });
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    }
});
