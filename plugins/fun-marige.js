const axios = require("axios");
const { cmd } = require("../zaidi");
const { fetchGif, gifToVideo } = require("../lib/fetchGif");

cmd({
    pattern: "marige",
    alias: ["marriage", "shadi", "wedding"],
    desc: "Random Marriage",
    category: "fun",
    react: "💍",
    filename: __filename
}, async (conn, mek, m, {
    isGroup,
    groupMetadata,
    sender,
    reply
}) => {

    try {
        if (!isGroup) return reply("❌ This command works only in groups.");

        if (!groupMetadata?.participants)
            return reply("❌ Group participants not found.");

        const botJid = conn.user?.id || conn.user?.jid || "";

        const members = groupMetadata.participants
            .map(v => v.id)
            .filter(id => id !== sender && id !== botJid);

        if (members.length < 1)
            return reply("❌ Not enough members.");

        const partner = members[Math.floor(Math.random() * members.length)];

        const { data } = await axios.get("https://api.waifu.pics/sfw/hug");

        const gif = await fetchGif(data.url);
        const video = await gifToVideo(gif);

        const text = `💍 *Shadi Mubarak!* 💒

👰 @${sender.split("@")[0]}
❤️
🤵 @${partner.split("@")[0]}

✨ May Allah bless you both.`;

        await conn.sendMessage(
            mek.chat,
            {
                video,
                gifPlayback: true,
                caption: text,
                mentions: [sender, partner]
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply("❌ Error:\n" + e.message);
    }
});
