const { cmd } = require('../zaidi');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "setsts",
    alias: ["setstatus", "sts"],
    desc: "Apna WhatsApp status (story) lagayein. Text ya image/video ke saath.",
    category: "profile",
    react: "📌"
}, async (conn, mek, m, { args, reply, sender, isReply }) => {
    let statusText = args.join(' ');
    let mediaBuffer = null;
    let type = 'text';

    // Agar kisi media (image/video) ko reply kiya hai
    if (m.quoted && m.quoted.mimetype) {
        const mimetype = m.quoted.mimetype;
        if (mimetype.startsWith('image/')) {
            type = 'image';
            const stream = await conn.downloadContentFromMessage(m.quoted, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaBuffer = buffer;
        } else if (mimetype.startsWith('video/')) {
            type = 'video';
            const stream = await conn.downloadContentFromMessage(m.quoted, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaBuffer = buffer;
        }
    } 
    // Agar URL diya hai
    else if (args[0] && args[0].match(/https?:\/\/.+/)) {
        try {
            mediaBuffer = await getBuffer(args[0]);
            // type guess karein (simple)
            if (args[0].match(/\.(jpg|jpeg|png|gif|webp)/i)) type = 'image';
            else if (args[0].match(/\.(mp4|mov|avi|mkv|webm)/i)) type = 'video';
        } catch (e) {
            return reply("❌ *URL se media nahi mila.*");
        }
    }

    try {
        if (mediaBuffer) {
            // Media status (image/video)
            await conn.sendMessage(sender, {
                [type]: mediaBuffer,
                caption: statusText || '',
                contextInfo: { mentionedJid: [sender] }
            }, { status: true });
            reply(`✅ *Status update ho gaya!* (${type})`);
        } else if (statusText) {
            // Text status
            await conn.sendMessage(sender, {
                text: statusText,
                contextInfo: { mentionedJid: [sender] }
            }, { status: true });
            reply(`✅ *Text status update ho gaya!*\nStatus: *${statusText}*`);
        } else {
            reply("❌ *Kuch likhiye ya koi image/video do!*\nExample: .setsts Hello World");
        }
    } catch (e) {
        console.error(e);
        reply("❌ *Status update nahi ho saka. Kuch masla hai.*");
    }
});
