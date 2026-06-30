const { cmd, commands } = require('../zaidi');
const { sleep } = require('../lib/functions');
const os = require("os");
const config = require('../config');

// 🎭 Funny Replies Array
const funnyReplies = [
    "😎 *Bhai main toh alive hoon!* Tension mat lo, abhi party shuru karte hain! 🎉",
    "🤖 *Robot zinda hai!* Kya aapko lagta hai main mar gaya tha? 😂",
    "🔥 *Alive hoon bhai!* Chal ab batao kya karna hai? 💪",
    "⚡ *Main toh kabhi marta nahi!* Just like cockroach 😂",
    "👑 *Zaidy-MD is alive!* ab main soch raha hoon, kya aap bhi alive ho? 😂",
    "🚀 *Alive hai boss!* Ready to dominate WhatsApp! 😎",
    "💀 *Zinda hoon!* lekin neend aa rahi hai... 😴",
    "🐱 *Main alive hoon!* Aur aap mere 9 lives mein se 8 bacha kar rakhe hain! 😹",
    "🤣 *Alive hoon!* Kya aapko laga main hamesha ke liye so gaya? Nahi yaar!",
    "🎯 *Alive hoon!* Target practice ke liye ready! 😎",
    "🍕 *Alive hoon!* Aur pizza bhi khaya hai! ab aapko kya chahiye?",
    "💥 *Alive hoon!* Jaise dynamite! Ek message aur blast ho jaunga! 😂"
];

cmd({
    pattern: "alive",
    alias: ["status", "live"],
    desc: "Check uptime and system status",
    category: "main",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "👑", key: m.key }
        });

        // 🎲 Random funny reply
        const randomFunny = funnyReplies[Math.floor(Math.random() * funnyReplies.length)];

        const totalCmds = commands.length;
        const uptime = () => {
            let sec = process.uptime();
            let h = Math.floor(sec / 3600);
            let m = Math.floor((sec % 3600) / 60);
            let s = Math.floor(sec % 60);
            return `${h}h ${m}m ${s}s`;
        };

        // 🎨 Status with funny reply
        const status = `╭═══ 👑 ALIVE ═══⊷
┃❃╭──────────────
┃❃│ ${randomFunny}
┃❃│ ──────────────
┃❃│ 🤖 Bot: 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪
┃❃│ 📊 Mode: ${config.WORK_TYPE || 'public'}
┃❃│ 🔣 Prefix: ${config.PREFIX || '.'}
┃❃│ 📦 Commands: ${totalCmds}
┃❃│ ⏳ Uptime: ${uptime()}
┃❃│ ✅ Status: 🟢 Active
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, {
            text: status,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {
        console.error("Error in alive command:", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply(`❌ Error: ${e.message}`);
    }
});