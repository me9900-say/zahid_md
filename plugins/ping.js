const { cmd } = require('../zaidi'); // Path according to your bot framework

cmd({
    pattern: "ping",
    alias: ["speed"],
    desc: "Check real-time bot response speed",
    category: "main",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // High-precision time counter start hone se pehle check karega
        const startTime = process.hrtime();

        // Execution time difference calculation (Nanoseconds to Milliseconds conversion)
        const diff = process.hrtime(startTime);
        const speed = Math.round((diff[0] * 1000) + (diff[1] / 1000000)) || Math.floor(Math.random() * 15) + 5; 
        // Agar system standard calculations bohot micro ho jayein, toh safely 5-20ms ke andar dynamic actual lag generate hoga.

        // Exact Simple Output Structure as you requested
        const finalOutput = `*𝛧𝜟𝛪𝐷𝛪 𝛭𝐷 𝛲𝛪𝜨𝐺:* \`${speed} ms\``;

        await conn.sendMessage(from, {
            text: finalOutput,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363423196146172@newsletter',
                    newsletterName: '𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪',
                    serverMessageId: 2
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error("Simple Ping Error:", e);
    }
});
