const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');

cmd({
    pattern: "groupstatus",
    alias: ["gstatus", "poststatus", "statuspost"],
    desc: "Post text or media to WhatsApp Group Status (green ring)",
    category: "group",
    react: "📡",
    filename: __filename
}, async (conn, mek, m, { body, reply, pushname, from }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "📡", key: m.key }
        });

        const caption = body.split(" ").slice(1).join(" ");
        const currentTime = new Date().toLocaleString();
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject || "Group";
        const groupId = from;

        // TEXT STATUS
        if (!m.quoted && caption) {
            const statusText = `╭═══ 📡 GROUP STATUS ═══⊷
┃❃╭──────────────
┃❃│ 👤 ${pushname || "User"}
┃❃│ 🏠 ${groupName}
┃❃│ ⏰ ${currentTime}
┃❃│ ──────────────
┃❃│ 💬 ${caption}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(
                groupId,
                { text: statusText },
                { status: true }
            );

            const done = `╭═══ ✅ STATUS ═══⊷
┃❃╭──────────────
┃❃│ ✅ Group status posted!
┃❃│ 🟢 Green ring active
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "✅", key: m.key }
            });
            return reply(done);
        }

        if (!m.quoted) {
            const display = `╭═══ 📡 GROUPSTATUS ═══⊷
┃❃╭──────────────
┃❃│ ❌ No message or media!
┃❃│ 💡 Use: .gstatus Hello
┃❃│ 💡 Or reply to media
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(display);
        }

        const quoted = m.quoted;
        const media = await quoted.download();
        const isStatusCapable = true;

        // IMAGE
        if (quoted.imageMessage) {
            await conn.sendMessage(
                groupId,
                {
                    image: media,
                    caption: `📸 GROUP STATUS
🏠 ${groupName}
👤 ${pushname || "User"}
🕒 ${currentTime}

${caption || "No Caption"}`
                },
                { status: true }
            );

            const done = `╭═══ ✅ STATUS ═══⊷
┃❃╭──────────────
┃❃│ ✅ Image status posted!
┃❃│ 🟢 Group green ring
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "✅", key: m.key }
            });
            return reply(done);
        }

        // VIDEO
        if (quoted.videoMessage) {
            await conn.sendMessage(
                groupId,
                {
                    video: media,
                    caption: `🎥 GROUP STATUS
🏠 ${groupName}
👤 ${pushname || "User"}
🕒 ${currentTime}

${caption || "No Caption"}`
                },
                { status: true }
            );

            const done = `╭═══ ✅ STATUS ═══⊷
┃❃╭──────────────
┃❃│ ✅ Video status posted!
┃❃│ 🟢 Group green ring
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "✅", key: m.key }
            });
            return reply(done);
        }

        // AUDIO
        if (quoted.audioMessage) {
            await conn.sendMessage(
                groupId,
                {
                    audio: media,
                    mimetype: "audio/mp4",
                    ptt: false
                },
                { status: true }
            );

            const done = `╭═══ ✅ STATUS ═══⊷
┃❃╭──────────────
┃❃│ ✅ Audio status posted!
┃❃│ 🟢 Group green ring
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "✅", key: m.key }
            });
            return reply(done);
        }

        // STICKER
        if (quoted.stickerMessage) {
            await conn.sendMessage(
                groupId,
                { sticker: media },
                { status: true }
            );

            const done = `╭═══ ✅ STATUS ═══⊷
┃❃╭──────────────
┃❃│ ✅ Sticker status posted!
┃❃│ 🟢 Group green ring
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "✅", key: m.key }
            });
            return reply(done);
        }

        // DOCUMENT / OTHER
        if (quoted.documentMessage || quoted.text) {
            await conn.sendMessage(
                groupId,
                {
                    text: `📄 GROUP STATUS
🏠 ${groupName}
👤 ${pushname || "User"}
🕒 ${currentTime}

${caption || "Document/Text status"}`
                },
                { status: true }
            );

            const done = `╭═══ ✅ STATUS ═══⊷
┃❃╭──────────────
┃❃│ ✅ Text/Doc status posted!
┃❃│ 🟢 Group green ring
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, {
                react: { text: "✅", key: m.key }
            });
            return reply(done);
        }

        const unsupported = `╭═══ ❌ STATUS ═══⊷
┃❃╭──────────────
┃❃│ ❌ Unsupported media type!
┃❃│ 📌 Reply to image/video/audio/sticker
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        return reply(unsupported);

    } catch (err) {
        console.log("GROUPSTATUS ERROR:", err);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply(`❌ Error: ${err.message}\n📌 Ensure bot is admin & group status feature supported.`);
    }
});