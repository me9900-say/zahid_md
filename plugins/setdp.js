const { cmd } = require('../zaidi');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "setdp",
    alias: ["setpp", "profilepic"],
    desc: "Apni profile picture change karein",
    category: "profile",
    react: "🖼️"
}, async (conn, mek, m, { args, reply, sender, isReply }) => {
    let mediaBuffer = null;

    // ✅ 1. Agar command khud image ke caption mein hai (self-image)
    if (m.mimetype && m.mimetype.startsWith('image/')) {
        try {
            const stream = await conn.downloadContentFromMessage(m, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaBuffer = buffer;
        } catch (e) {
            return reply("❌ *Image download nahi ho saki.*");
        }
    }
    // ✅ 2. Agar kisi image ko reply kiya hai
    else if (m.quoted && m.quoted.mimetype && m.quoted.mimetype.startsWith('image/')) {
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
    // ✅ 3. Agar URL diya hai
    else if (args[0] && args[0].match(/https?:\/\/.+/)) {
        try {
            mediaBuffer = await getBuffer(args[0]);
        } catch (e) {
            return reply("❌ *URL se image nahi mili.*");
        }
    }

    if (!mediaBuffer) {
        return reply("❌ *Koi image do!*\n\n📸 *Tarike:*\n1. Image reply karein: `.setdp`\n2. Image caption mein likhein: `.setdp`\n3. URL dein: `.setdp https://example.com/image.jpg`");
    }

    try {
        // Direct update without processing
        await conn.updateProfilePicture(sender, mediaBuffer);
        reply("✅ *Profile picture update ho gayi!*");
    } catch (e) {
        console.error(e);
        reply("❌ *DP update nahi ho saki. Kuch masla hai.*");
    }
});
