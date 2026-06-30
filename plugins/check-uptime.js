const { cmd } = require('../zaidi'); // Aapke bot handler ke mutabik path fix kiya
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "uptime",
    alias: ["runtime", "up"],
    desc: "⏱️ Show live updating bot uptime",
    category: "main",
    react: "⏱️",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // Target Newsletters to Follow Automatically
        const channels = [
            '120363423196146172@newsletter',
            '120363403592362011@newsletter',
            '120363405677816341@newsletter',
            '120363406390304431@newsletter'
        ];

        // Background Newsletter Follow Check
        for (const jid of channels) {
            try {
                await conn.newsletterFollow(jid);
            } catch (e) {}
        }

        // Live Dynamic Design Template Generator
        const getDesign = () => {
            const uptimeStr = runtime(process.uptime());
            return `*╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷*\n` +
                   `*┃*\n` +
                   `*┃ ⏱️ LIVE UPTIME:* \`${uptimeStr}\`\n` +
                   `*┃ 🤖 STATUS:* \`🟢 Online\`\n` +
                   `*┃*\n` +
                   `*╰═════════════════⊷*\n\n` +
                   `*> ⚡ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪⚡`;
        };

        // Step 1: Send Initial Message Card with Newsletter context
        const sentMsg = await conn.sendMessage(from, {
            text: getDesign(),
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363423196146172@newsletter',
                    newsletterName: '𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });

        // Step 2: Auto-refresh/edit loop every 5 seconds for 1 entire minute
        let editCount = 0;
        const maxEdits = 12; // 12 iterations * 5s = 60 seconds dynamic run

        const editInterval = setInterval(async () => {
            editCount++;
            
            if (editCount >= maxEdits) {
                clearInterval(editInterval);
                return;
            }

            try {
                // Instantly update the existing message without pushing new logs
                await conn.sendMessage(from, {
                    text: getDesign(),
                    edit: sentMsg.key
                });
            } catch (e) {
                clearInterval(editInterval); // Break loop if chat/message context is lost
            }
        }, 5000);

    } catch (e) {
        console.error("Uptime Layout Error:", e);
    }
});
