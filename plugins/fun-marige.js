const { cmd } = require("../zaidi");

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

        const members = groupMetadata.participants
            .map(v => v.id)
            .filter(id => id !== (conn.user?.id || conn.user?.jid || ""));

        if (members.length < 2)
            return reply("❌ Not enough members in this group!");

        // Random Groom
        const groom = members[Math.floor(Math.random() * members.length)];

        // Random Bride (Different from Groom)
        let bride;
        do {
            bride = members[Math.floor(Math.random() * members.length)];
        } while (bride === groom);

        const text = `💍 *Wedding Ceremony* 💍

✨ آج گروپ میں شادی طے پا گئی!

🤵 *دولہا:* @${groom.split("@")[0]}
👰 *دلہن:* @${bride.split("@")[0]}

💐 اللہ تعالیٰ دونوں کی جوڑی سلامت رکھے، خوشیاں، محبت اور برکت عطا فرمائے۔ آمین! ❤️

🎉 *Everyone, congratulate the newly married couple!* 🥳`;

        await conn.sendMessage(
            mek.chat,
            {
                text,
                mentions: [groom, bride]
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply("❌ Error:\n" + e.message);
    }
});
