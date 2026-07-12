const { cmd } = require('../zaidi');
const { fetchGif, gifToSticker } = require('../lib/sticker-utils');

cmd({
    pattern: "attp",
    alias: ["attptext", "textsticker", "namesticker", "stickername", "at", "att", "atp"],
    react: "✨",
    desc: "Convert text into animated sticker",
    category: "sticker",
    use: ".attp <text>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {

    try {
        // اگر صارف ٹیکسٹ نہ لکھے
        if (!args[0]) {
            await conn.sendMessage(from, { react: { text: "⚠️", key: m.key } });
            return reply("🥺 *No Text Provided!*\n💡 *Use:* `.attp Bilal`");
        }

        // کام شروع ہونے کا ری ایکشن
        await conn.sendMessage(from, { react: { text: "✨", key: m.key } });

        // بالکل سمپل لوڈنگ میسج
        await conn.sendMessage(from, {
            text: `⏳ *Making Sticker for:* ${args.join(" ")}...`,
            quoted: mek
        });

        const text = encodeURIComponent(args.join(" "));

        // API سے gif حاصل کرنا اور اسٹیکر بنانا
        const gifBuffer = await fetchGif(`https://api-fix.onrender.com/api/maker/attp?text=${text}`);
        const sticker = await gifToSticker(gifBuffer);

        // اسٹیکر سینڈ کرنا
        await conn.sendMessage(from, { sticker }, { quoted: mek });

        // کامیابی کا ری ایکشن
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.log("ATTP ERROR:", e);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        reply("❌ *Sticker banane me error aya!*");
    }
});
