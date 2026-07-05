const axios = require("axios");
const yts = require("yt-search");
const { cmd } = require("../zaidi");
const { fakevCard } = require("../lib/fakevCard");

cmd({
    pattern: "video",
    alias: ["ytmp4", "playvideo", "mp4", "vdo"],
    react: "🎥",
    desc: "YouTube search & MP4 video play (2-in-1 Image + Video Mode with User Mention)",
    category: "download",
    use: ".video <video name>",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, botNumber, sender }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            const noQueryLayout = `*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰🎥 𝐕𝐈𝐃𝐄𝐎 𝐏𝐋𝐀𝐘𝐄𝐑 ⊱┈─̇─̣╌*
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
            return conn.sendMessage(from, { text: 
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ No results found for your query!
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*` 
            }, { quoted: fakevCard });
        }

        const video = search.videos[0];
        let downloadUrl = "";
        let videoTitle = video.title;

        /* 🚀 Fetch Video Link from Jawad Tech API */
        try {
            const res = await axios.get(
                `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}`,
                { timeout: 25000 }
            );
            
            // Checking common API response structures for video link
            if (res.data && res.data.status) {
                downloadUrl = res.data.result?.download || res.data.result?.videoUrl || res.data.result?.url;
                videoTitle = res.data.result?.title || video.title;
            }
        } catch (apiErr) {
            console.error('[video] Jawad Tech API error:', apiErr.message);
        }

        if (!downloadUrl) {
            return conn.sendMessage(from, { text: 
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ Video link could not be fetched from API.
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*` 
            }, { quoted: fakevCard });
        }

        // 📝 کسٹم باکس ڈیزائن مع مینشن (Mentions)
        const videoCaption = `*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰🎥 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍load ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│* 🎥 Title: ${videoTitle}
*│* ⏱️ Duration: ${video.timestamp || "Unknown"}
*│* 👥 Requested By: @${sender.split("@")[0]}
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*`;

        /* 🖼️ 1. پہلے ویڈیو کی پکچر ڈیزائن اور مینشن کے ساتھ جائے گی */
        const sentInfo = await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: videoCaption,
            mentions: [sender]
        }, { quoted: fakevCard });

        /* 🎥 2. اس کے فوراً بعد رئیل ویڈیو فارمیٹ میں ویڈیو جائے گی */
        await conn.sendMessage(from, {
            video: { url: downloadUrl }, 
            mimetype: "video/mp4",
            caption: `*🎬 ${videoTitle}*`, // ویڈیو کے نیچے ہلکا سا کیپشن
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
