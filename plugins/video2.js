// =============================================
// ZAIDI-MD — video2.js (COMPLETELY REWRITTEN & FIXED)
// Commands: .video2 .vdo2 .playvideo2
// Uses Multi-API fallback: JawadTech → David Cyril
// Fix: No 'upload' property (Bug #1), proper scoping (Bug #2)
// =============================================

const axios = require("axios");
const yts = require("yt-search");
const { cmd } = require("../zaidi");
const { fakevCard } = require("../lib/fakevCard");

// ── Multi-API fallback system ──
// Agar pehla API fail ho to doosra try hoga automatically
const VIDEO_APIS = [
    {
        name: "JawadTech",
        buildUrl: (ytUrl) => `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}`,
        extract: (data) => {
            if (data?.status && data?.result?.mp4) {
                return {
                    downloadUrl: data.result.mp4,
                    title: data.result.title || null,
                    thumbnail: data.result.thumbnail || null,
                    quality: "HD",
                    duration: null
                };
            }
            return null;
        }
    },
    {
        name: "David Cyril",
        buildUrl: (ytUrl) => `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(ytUrl)}&apikey=`,
        extract: (data) => {
            if (data?.result?.download_url) {
                return {
                    downloadUrl: data.result.download_url,
                    title: data.result.title || null,
                    thumbnail: data.result.thumbnail || null,
                    quality: data.result.quality || "Unknown",
                    duration: data.result.duration ? data.result.duration + "s" : null
                };
            }
            return null;
        }
    },
    {
        name: "Izumi",
        buildUrl: (ytUrl) => `https://api.ootaizumi.web.id/downloader/youtube?url=${encodeURIComponent(ytUrl)}&format=mp4`,
        extract: (data) => {
            if (data?.status && data?.result?.download) {
                return {
                    downloadUrl: data.result.download,
                    title: data.result.title || null,
                    thumbnail: null,
                    quality: "Auto",
                    duration: null
                };
            }
            return null;
        }
    }
];

async function fetchVideoWithFallback(ytUrl) {
    for (const api of VIDEO_APIS) {
        try {
            console.log(`[video2] Trying ${api.name}...`);
            const res = await axios.get(api.buildUrl(ytUrl), { timeout: 30000 });
            const result = api.extract(res.data);
            if (result && result.downloadUrl) {
                console.log(`[video2] ✅ ${api.name} succeeded!`);
                return result;
            }
            console.log(`[video2] ⚠️ ${api.name} returned no usable link.`);
        } catch (err) {
            console.error(`[video2] ❌ ${api.name} failed: ${err.message}`);
        }
    }
    return null;
}

cmd({
    pattern: "video2",
    alias: ["vdo2", "playvideo2"],
    react: "🎬",
    desc: "YouTube video download karo (Multi-API fallback system ke saath)",
    category: "download",
    use: ".video2 <video name or YouTube link>",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    try {
        const query = args.join(" ").trim();

        // ── 1. Query check ──
        if (!query) {
            return conn.sendMessage(from, { text:
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰🎬 𝐕𝐈𝐃𝐄𝐎 𝐏𝐋𝐀𝐘𝐄Ｒ 𝟐 ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│* ❌ Video ka naam ya YouTube link daalein
*│* 💡 Example: .video2 Headlights Eminem
*│* 🔗 Ya: .video2 https://youtu.be/xxxxx
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*`
            }, { quoted: fakevCard });
        }

        // ── 2. Processing react ──
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // ── 3. YouTube URL ya naam? ──
        const isYtLink = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))/i.test(query);
        let ytUrl = query;
        let ytTitle = "Unknown Video";
        let ytThumbnail = "";
        let ytDuration = "Unknown";
        let ytViews = "N/A";
        let ytAuthor = "";

        if (!isYtLink) {
            // Naam diya hai — search karo
            const search = await yts(query);
            if (!search.videos || !search.videos.length) {
                await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
                return conn.sendMessage(from, { text:
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ Koi result nahi mila!
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*`
                }, { quoted: fakevCard });
            }
            const vid = search.videos[0];
            ytUrl = vid.url;
            ytTitle = vid.title;
            ytThumbnail = vid.thumbnail || "";
            ytDuration = vid.timestamp || "Unknown";
            ytViews = vid.views ? Number(vid.views).toLocaleString() : "N/A";
            ytAuthor = vid.author?.name || "";
        }

        // ── 4. Multi-API fallback se video download karo ──
        const result = await fetchVideoWithFallback(ytUrl);

        if (!result) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return conn.sendMessage(from, { text:
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ Tamam APIs ne fail kar diya. Thodi der baad try karein.
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*`
            }, { quoted: fakevCard });
        }

        // API se mili info use karo (agar YouTube search se nahi mili to)
        const finalTitle = result.title || ytTitle;
        const finalThumbnail = result.thumbnail || ytThumbnail;
        const finalQuality = result.quality || "Auto";
        const finalDuration = result.duration || ytDuration;

        // ── 5. Info card bhejo ──
        const videoCaption = `*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰🎬 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│* 🎥 Title: ${finalTitle}
*│* 🎚️ Quality: ${finalQuality}
*│* ⏱️ Duration: ${finalDuration}
*│* 👁️ Views: ${ytViews}
*│* 👥 Requested By: @${sender.split("@")[0]}
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*`;

        let sentInfo;
        if (finalThumbnail) {
            sentInfo = await conn.sendMessage(from, {
                image: { url: finalThumbnail },
                caption: videoCaption,
                mentions: [sender]
            }, { quoted: fakevCard });
        } else {
            sentInfo = await conn.sendMessage(from, {
                text: videoCaption,
                mentions: [sender]
            }, { quoted: fakevCard });
        }

        // ── 6. Video bhejo ──
        // BUG #1 FIX: 'upload: conn.waUploadToServer' NAHI — yeh Baileys v7 mein invalid hai
        await conn.sendMessage(from, {
            video: { url: result.downloadUrl },
            mimetype: "video/mp4",
            caption: `*🎬 ${finalTitle}*\n\n> _ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪_`
        }, { quoted: sentInfo });

        // ── 7. Success react ──
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (err) {
        console.error("[video2] ERROR:", err.message);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        conn.sendMessage(from, { text:
`*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│* ❌ Video download mein error. Dobara try karein.
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*`
        }, { quoted: fakevCard });
    }
});
