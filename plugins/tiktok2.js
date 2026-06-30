const { cmd } = require('../zaidi');   // ✅ Sahi import
const axios = require('axios');        // Agar installed nahi toh: npm install axios

// ===== TikTok API (Same Logic) =====
async function tiktok(url) {
    try {
        let res = await axios.get(`https://tikwm.com/api/?url=${url}`);
        return res.data.data?.play || null;
    } catch {
        return null;
    }
}

cmd({
    pattern: "tiktok2",          // Primary command
    alias: ["tt2", "ttdl2", "dltt2"], // ✅ Chahte the yeh aliases
    desc: "Download TikTok video (v2)",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, quoted }) => {

    // 1️⃣ Check if link provided
    if (!args[0]) {
        return reply("❌ TikTok link do!\nExample: .tiktok2 https://www.tiktok.com/@user/video/1234567890");
    }

    let url = args[0];

    // 2️⃣ Validate TikTok URL
    if (!url.includes("tiktok.com")) {
        return reply("❌ Sirf TikTok link daalo!");
    }

    // 3️⃣ Status message
    await reply("⏳ TikTok downloading...");

    try {
        let video = await tiktok(url);

        if (!video) {
            return reply("❌ Download failed. Maybe link invalid or API down.");
        }

        // 4️⃣ Send video
        await conn.sendMessage(from, {
            video: { url: video },
            caption: "✅ *TikTok Downloaded*"
        }, { quoted: mek });

    } catch (error) {
        console.error("TikTok2 Error:", error);
        return reply("⚠️ Kuch gadbad ho gayi! Try again later.");
    }
});
