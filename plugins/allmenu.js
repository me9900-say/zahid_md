const { cmd, commands } = require('../zaidi');
const { sleep } = require('../lib/functions');
const moment = require("moment-timezone");
const config = require('../config');
const { fakevCard } = require('../lib/fakevCard');

cmd({
    pattern: "menu",
    alias: ["commandlist", "allmenu", "help"],
    desc: "Show all bot commands",
    category: "system",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    try {
        await conn.sendMessage(from, {
            react: { text: "📋", key: m.key }
        });

        // 📊 Count commands & group them
        let totalCommands = 0;
        let grouped = {};

        for (const cmd of commands) {
            if (!cmd.pattern || !cmd.category) continue;
            totalCommands++;
            if (!grouped[cmd.category]) grouped[cmd.category] = [];
            grouped[cmd.category].push(cmd.pattern);
        }

        // ⏰ Time & Date (Aap apne zone ke hisab se badal sakte hain, e.g., Asia/Karachi)
        const time = moment().tz("Africa/Kampala").format("hh:mm:ss A");
        const date = moment().tz("Africa/Kampala").format("dddd, DD MMMM YYYY");

        // 🎨 Build Header (Exact Layout)
        let menu = `*╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷*\n`;
        menu += `*┃❃╭──────────────*\n`;
        menu += `*┃❃│ ⏰ ᴛɪᴍᴇ: ${time}*\n`;
        menu += `*┃❃│ 📅 ᴅᴀᴛᴇ: ${date}*\n`;
        menu += `*┃❃│ 📦 ᴛᴏᴛᴀʟ: ${totalCommands} ᴄᴏᴍᴍᴀɴᴅs*\n`;
        menu += `*┃❃│ 🔣 ᴘʀᴇғɪx: ${config.PREFIX || '.'}*\n`;
        menu += `*┃❃╰───────────────*\n`;
        menu += `*╰═════════════════⊷*\n\n`;

        // Category Emojis & Fancy Headers Mapping
        const categoryMapping = {
            "main": { emoji: "💠", title: "𝐌𝐚𝐢𝐧" },
            "system": { emoji: "🔧", title: "𝐒𝐲𝐬𝐭𝐞𝐦" },
            "settings": { emoji: "⚙️", title: "𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬" },
            "owner": { emoji: "👑", title: "𝐎𝐰𝐧𝐞𝐫" },
            "group": { emoji: "👥", title: "𝐆𝐫𝐨𝐮𝐩" },
            "admin": { emoji: "🛡️", title: "𝐀𝐝𝐦𝐢𝐧" },
            "download": { emoji: "📥", title: "𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝" },
            "downloader": { emoji: "📥", title: "𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫" },
            "sticker": { emoji: "🎨", title: "𝐒𝐭𝐢𝐜𝐤𝐞𝐫" },
            "fun": { emoji: "🎮", title: "𝐅𝐮𝐧" },
            "general": { emoji: "📌", title: "𝐆𝐞𝐧𝐞𝐫𝐚𝐥" },
            "tools": { emoji: "🔧", title: "𝐓𝐨𝐨𝐥𝐬" },
            "search": { emoji: "🔍", title: "𝐒𝐞𝐚𝐫𝐜𝐡" }
        };

        // Function to convert command name to Small Caps text
        const toSmallCaps = (text) => {
            const normal = "abcdefghijklmnopqrstuvwxyz";
            const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ";
            return text.split('').map(char => {
                const index = normal.indexOf(char.toLowerCase());
                return index !== -1 ? smallCaps[index] : char;
            }).join('');
        };

        const sortedCategories = Object.keys(grouped).sort();

        // Build Categories & Commands List
        for (const cat of sortedCategories) {
            const catKey = cat.toLowerCase();
            const emoji = categoryMapping[catKey]?.emoji || "✨";
            const fancyTitle = categoryMapping[catKey]?.title || cat.charAt(0).toUpperCase() + cat.slice(1);

            menu += `*╭─❏ ${emoji} ${fancyTitle} ${emoji} ❏*\n`;
            
            const sortedCmds = grouped[cat].sort();
            for (const c of sortedCmds) {
                const smallCapsCmd = toSmallCaps(c);
                menu += `*│ ${smallCapsCmd}*\n`;
            }
            menu += `*╰─────────────────*\n\n`;
        }

        // Footer
        menu += `*> 𝛲𝜣𝑊𝛯𝑅𝛯𝐷 𝐵𝜳 𝛧𝜟𝛪𝐃𝐈 𝛭𝐷 ᥫ᭡*`;

        // Send Menu with Image
        await conn.sendMessage(from, {
            image: { url: "https://up6.cc/2026/05/177971006919991.png" },
            caption: menu,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: [m.sender],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363423196146172@newsletter",
                    newsletterName: "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪",
                    serverMessageId: 2,
                },
            },
        }, { quoted: fakevCard });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {
        console.error("Menu Error:", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ Menu failed to load!");
    }

});
