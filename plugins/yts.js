const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const yts = require('yt-search');

cmd({
    pattern: "yts",
    alias: ["ytsearch"],
    react: "☺️",
    desc: "Search videos on YouTube",
    category: "search",
    use: ".yts <video name>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "☺️", key: m.key }
        });

        if (!q) {
            const display = `*🔍 AP NE YOUTUBE KI VIDEOS SEARCH KARNI HAI 🥺*\n\n*Use:*\n.yts Video name\n\n*Example:*\n.yts Tajdar e Haram`;

            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(display);
        }

        const search = await yts(q);
        const videos = search.videos.slice(0, 10);

        if (videos.length === 0) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply("*❌ KOI VIDEO NAHI MILI 🥺*");
        }

        let text = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃  📺 *YOUTUBE SEARCH*  ┃
┃  ═══════════════════════
┃  🔍 *${q}*
┃  📊 *${videos.length} results*
┃  ═══════════════════════
┃
`;

        for (let i = 0; i < videos.length; i++) {
            const v = videos[i];
            text += `┃  ${i + 1}. ${v.title}\n`;
            text += `┃     ⏱️ ${v.timestamp}  👁️ ${v.views}\n`;
            text += `┃     🔗 ${v.url}\n`;
            text += `┃\n`;
        }

        text += `┃  ═══════════════════════\n`;
        text += `┃  🔹 *${videos.length} videos found*\n`;
        text += `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
        text += `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(
            from,
            { text },
            { quoted: mek }
        );

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {
        console.log("YTS ERROR:", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("*❌ YOUTUBE SEARCH ME ERROR AYA 🥺*");
    }
});