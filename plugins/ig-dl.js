const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const axios = require('axios');
const { fakevCard } = require('../lib/fakevCard');

// ==================== IGDL (Primary) ====================
cmd({
    pattern: "igdl",
    alias: ["instagram", "insta", "ig"],
    react: "⬇️",
    desc: "Download Instagram videos/reels",
    category: "downloader",
    use: ".igdl <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        const url = q || m.quoted?.text;
        if (!url || !url.includes("instagram.com")) {
            const display = `╭═══ ❌ IGDL ═══⊷
┃❃╭──────────────
┃❃│ ❌ No Instagram link!
┃❃│ 💡 Use: .igdl <url>
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(display);
        }

        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        if (!response.data?.status || !response.data.data?.length) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ Failed to fetch media. Invalid link or private content.");
        }

        for (const item of response.data.data) {
            await conn.sendMessage(from, {
                [item.type === 'video' ? 'video' : 'image']: { url: item.url },
                caption: `╭═══ 📥 IG DOWNLOAD ═══⊷
┃❃╭──────────────
┃❃│ 📱 Instagram
┃❃│ 🎯 Type: ${item.type || 'Media'}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
            }, { quoted: fakevCard });
        }

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (error) {
        console.error('IGDL Error:', error);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ Download failed. Try again later.");
    }
});

// ==================== IGDL4 (Alternative API) ====================
cmd({
    pattern: "igdl4",
    alias: ["instagram4", "insta4", "ig4", "igvideo4"],
    react: '📶',
    desc: "Download videos from Instagram (Alternative API)",
    category: "download",
    use: ".igdl4 <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        const igUrl = q || m.quoted?.text;
        if (!igUrl || !igUrl.includes("instagram.com")) {
            const display = `╭═══ ❌ IGDL4 ═══⊷
┃❃╭──────────────
┃❃│ ❌ No Instagram link!
┃❃│ 💡 Use: .igdl4 <url>
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(display);
        }

        const apiUrl = `https://bk9.fun/download/instagram?url=${encodeURIComponent(igUrl)}`;
        const response = await axios.get(apiUrl);

        if (!response.data?.status || !response.data?.BK9?.[0]?.url) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply('❌ Unable to fetch the video.');
        }

        const videoUrl = response.data.BK9[0].url;
        const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(videoResponse.data, 'binary');

        await conn.sendMessage(from, {
            video: videoBuffer,
            caption: `╭═══ 📥 IG DOWNLOAD ═══⊷
┃❃╭──────────────
┃❃│ 📱 Instagram
┃❃│ 📶 Quality: HD
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        }, { quoted: fakevCard });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (error) {
        console.error('IGDL4 Error:', error);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply('❌ API 2 failed. Try .igdl for primary download.');
    }
});

// ==================== IGDL2 (Alternative API v5) ====================
cmd({
    pattern: "igdl2",
    alias: ["instagram2", "ig2", "instadl2"],
    react: '📥',
    desc: "Download videos from Instagram (API v5)",
    category: "download",
    use: ".igdl2 <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        const igUrl = q || m.quoted?.text;
        if (!igUrl || !igUrl.includes("instagram.com")) {
            const display = `╭═══ ❌ IGDL2 ═══⊷
┃❃╭──────────────
┃❃│ ❌ No Instagram link!
┃❃│ 💡 Use: .igdl2 <url>
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(display);
        }

        const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(igUrl)}`;
        const response = await axios.get(apiUrl);

        const data = response.data;

        if (!data.status || !data.result || !Array.isArray(data.result)) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply('❌ Unable to fetch the video.');
        }

        const videoUrl = data.result[0];
        if (!videoUrl) return reply("❌ No video found.");

        const metadata = data.metadata || {};
        const author = metadata.author || "Unknown";
        const caption = metadata.caption ? metadata.caption.slice(0, 300) + "..." : "No caption.";

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: `╭═══ 📥 IG DOWNLOAD ═══⊷
┃❃╭──────────────
┃❃│ 📱 Instagram
┃❃│ 👤 ${author}
┃❃│ 💬 ${caption}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        }, { quoted: fakevCard });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (error) {
        console.error('IGDL2 Error:', error);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply('❌ Failed to download.');
    }
});

// ==================== IG3 ====================
cmd({
    pattern: "ig3",
    alias: ["insta3", "instagram3"],
    desc: "Download Instagram video",
    category: "downloader",
    react: "⤵️",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        if (!q) {
            const display = `╭═══ ❌ IG3 ═══⊷
┃❃╭──────────────
┃❃│ ❌ No Instagram link!
┃❃│ 💡 Use: .ig3 <url>
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(display);
        }

        if (!q.includes("instagram.com")) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ Invalid Instagram link.");
        }

        const loading = `╭═══ ⏳ IG3 ═══⊷
┃❃╭──────────────
┃❃│ ⏳ Downloading...
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await reply(loading);

        const apiUrl = `https://rest-lily.vercel.app/api/downloader/igdl?url=${q}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data || !data.data[0]) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("❌ Failed to fetch Instagram video.");
        }

        const { url } = data.data[0];

        await conn.sendMessage(from, {
            video: { url: url },
            caption: `╭═══ 📥 IG DOWNLOAD ═══⊷
┃❃╭──────────────
┃❃│ 📱 Instagram
┃❃│ ✅ Download complete
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        }, { quoted: fakevCard });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {
        console.error("IG3 Error:", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply(`❌ Error: ${e.message}`);
    }
});