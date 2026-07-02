const { cmd } = require('../zaidi');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "setdp",
    alias: ["setpp", "profilepic"],
    desc: "Apni profile picture change karein. Usage: .setdp (image ke saath reply karein ya image URL dein)",
    category: "profile",
    react: "🖼️"
}, async (conn, mek, m, { args, reply, sender, isReply }) => {
    let mediaBuffer = null;

    // Agar image ke saath reply kiya hai
    if (m.quoted && m.quoted.mimetype && m.quoted.mimetype.startsWith('image/')) {
        try {
            const stream = await conn.downloadContentFromMessage(m.quoted, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaBuffer = buffer;
        } catch (e) {
            return reply("❌ *Image download nahi ho saki.*");
        }
    } 
    // Agar URL diya hai
    else if (args[0] && args[0].match(/https?:\/\/.+/)) {
        try {
            mediaBuffer = await getBuffer(args[0]);
        } catch (e) {
            return reply("❌ *URL se image nahi mili.*");
        }
    }

    if (!mediaBuffer) {
        return reply("❌ *Koi image do!*\nYa to kisi image ko .setdp ke saath reply karein, ya image ka URL dein.");
    }

    try {
        await conn.updateProfilePicture(sender, mediaBuffer);
        reply("✅ *Profile picture update ho gayi!*");
    } catch (e) {
        console.error(e);
        reply("❌ *DP update nahi ho saki. Kuch masla hai.*");
    }
});
