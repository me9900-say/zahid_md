const { cmd } = require('../zaidi');
const TikTokScraper = require('nexora-tiktok-search');

const tiktok = new TikTokScraper();

cmd({
    pattern: "ttsearch",
    alias: ["ts", "tiktoksearch", "tts"],
    desc: "Search TikTok videos (Better API)",
    category: "downloader",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {

    const query = args.join(' ');
    if (!query) {
        return reply("❌ Kuch search karo!\nExample: .ttsearch nisha pomi");
    }

    await reply(`⏳ *"${query}"* search ho raha hai...`);

    try {
        // 10 results le rahe hain, 5 bhejenge
        const results = await tiktok.search(query, 10);

        if (!results || results.length === 0) {
            return reply(`❌ *"${query}"* ke liye koi video nahi mili.\n\n💡 Try karo:\n• Lamba keyword use karo\n• Kuch trending hashtag try karo`);
        }

        const total = Math.min(results.length, 5);
        await reply(`✅ *${total}* videos mil gaye! Bhej raha hoon...`);

        for (let i = 0; i < total; i++) {
            const video = results[i];
            if (!video.downloadUrl) continue;

            try {
                await conn.sendMessage(from, {
                    video: { url: video.downloadUrl },
                    caption: `🎬 *Video ${i+1}/${total}*\n📝 ${video.description?.slice(0, 100) || 'No Title'}${video.description?.length > 100 ? '...' : ''}\n👤 @${video.author || 'Unknown'}\n❤️ ${video.likes || 0} | 💬 ${video.comments || 0}`
                }, { quoted: mek });
                
                // ✨ 1.5 sec delay (anti-ban)
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (sendErr) {
                console.error("Send error:", sendErr.message);
                continue;
            }
        }
    } catch (error) {
        console.error("TTSearch Error:", error);
        return reply("⚠️ Kuch gadbad ho gayi! Try again later.");
    }
});
