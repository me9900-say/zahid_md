const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const config = require('../config');
const { fakevCard } = require('../lib/fakevCard');
const { safeDecode } = require('../lib/permissions');

// ==================== REQUEST LIST ====================
cmd({
    pattern: "requestlist",
    desc: "Shows pending group join requests",
    category: "group",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        if (!isGroup) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ This command can only be used in groups.");
        }
        if (!isAdmins) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Only group admins can use this command.");
        }
        if (!isBotAdmins) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ I need to be an admin to view join requests.");
        }

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (requests.length === 0) {
            await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
            return reply("ℹ️ No pending join requests.");
        }

        let text = `╭═══ 📋 JOIN REQUESTS ═══⊷\n`;
        text += `┃❃╭──────────────\n`;
        text += `┃❃│ Total: ${requests.length}\n`;
        requests.forEach((user, i) => {
            text += `┃❃│ ${i+1}. @${user.jid.split('@')[0]}\n`;
        });
        text += `┃❃╰───────────────\n`;
        text += `╰═════════════════⊷\n\n`;
        text += `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        return reply(text, { mentions: requests.map(u => u.jid) });
    } catch (error) {
        console.error("Request list error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply("❌ Failed to fetch join requests.");
    }
});

// ==================== ACCEPT ALL ====================
cmd({
    pattern: "acceptall",
    desc: "Accepts all pending group join requests",
    category: "group",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        if (!isGroup) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ This command can only be used in groups.");
        }
        if (!isAdmins) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Only group admins can use this command.");
        }
        if (!isBotAdmins) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ I need to be an admin to accept join requests.");
        }

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (requests.length === 0) {
            await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
            return reply("ℹ️ No pending join requests to accept.");
        }

        const jids = requests.map(u => u.jid);
        await conn.groupRequestParticipantsUpdate(from, jids, "approve");
        
        const display = `╭═══ ✅ ACCEPT ALL ═══⊷
┃❃╭──────────────
┃❃│ ✅ Accepted: ${requests.length} requests
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, { react: { text: '👍', key: m.key } });
        return reply(display);
    } catch (error) {
        console.error("Accept all error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply("❌ Failed to accept join requests.");
    }
});

// ==================== REJECT ALL ====================
cmd({
    pattern: "rejectall",
    desc: "Rejects all pending group join requests",
    category: "group",
    react: "❌",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        if (!isGroup) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ This command can only be used in groups.");
        }
        if (!isAdmins) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Only group admins can use this command.");
        }
        if (!isBotAdmins) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ I need to be an admin to reject join requests.");
        }

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (requests.length === 0) {
            await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
            return reply("ℹ️ No pending join requests to reject.");
        }

        const jids = requests.map(u => u.jid);
        await conn.groupRequestParticipantsUpdate(from, jids, "reject");
        
        const display = `╭═══ ❌ REJECT ALL ═══⊷
┃❃╭──────────────
┃❃│ ❌ Rejected: ${requests.length} requests
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, { react: { text: '👎', key: m.key } });
        return reply(display);
    } catch (error) {
        console.error("Reject all error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply("❌ Failed to reject join requests.");
    }
});

// ==================== KICK ====================
cmd({
    pattern: "kick",
    alias: ["remove", "k"],
    desc: "Remove a group member",
    category: "admin",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isOwner, groupAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need admin rights to remove members.");

        // ---- Correct target resolution ----
        // NEVER use ctx.quoted here — main.js sets it to `mek` (the raw
        // incoming command message itself, not the message being replied
        // to). Using `quoted.sender` on that object returns the *command
        // sender's* JID — and in self-bot mode (owner controlling the bot
        // from their own WhatsApp app), that JID IS the bot's own JID,
        // which is exactly why the bot ended up kicking itself.
        // ctx.mentionedJid is also never populated by main.js, so it was
        // always undefined. Pull both values directly off the serialized
        // `m` object instead, which actually carries the real data:
        //   - m.quoted.participant  -> the JID of whoever sent the
        //                              message being replied to
        //   - m.msg.contextInfo.mentionedJid -> array of tagged JIDs
        const mentioned = m.msg?.contextInfo?.mentionedJid || [];
        const target = m.quoted?.participant || mentioned[0];

        if (!target) {
            return reply("❌ Reply to a user's message or tag them (@user) to kick!");
        }

        // ---- Safety checks ----
        const botJid = safeDecode(conn.user.id);
        const targetJid = safeDecode(target);

        if (targetJid === botJid) {
            return reply("❌ I can't kick myself!");
        }

        if (Array.isArray(groupAdmins) && groupAdmins.includes(targetJid) && !isOwner) {
            return reply("❌ I can't kick another admin!");
        }

        await conn.groupParticipantsUpdate(from, [target], "remove");

        const display = `╭═══ 🗑️ KICK ═══⊷
┃❃╭──────────────
┃❃│ 🚫 Removed: @${target.split('@')[0]}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, { text: display, mentions: [target] }, { quoted: m });

    } catch (error) {
        console.error("Kick error:", error);
        reply("❌ Failed to remove member.");
    }
});

// ==================== KICK ALL ====================
cmd({
    pattern: "kickall",
    desc: "Remove all non-admin members",
    category: "admin",
    react: "⚠️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ Group command only!");

        const metadata = await conn.groupMetadata(from);
        const participants = metadata.participants;

        const admins = participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => p.id);

        if (!admins.includes(m.sender)) return reply("❌ Only admins can use this!");

        const botJid = conn.user.id.includes(':')
            ? conn.user.id.split(':')[0] + "@s.whatsapp.net"
            : conn.user.id;

        const toKick = participants
            .map(p => p.id)
            .filter(id => !admins.includes(id) && id !== botJid);

        const display = `╭═══ ⚠️ KICK ALL ═══⊷
┃❃╭──────────────
┃❃│ ⏳ Removing ${toKick.length} members...
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await reply(display);

        for (let user of toKick) {
            await conn.groupParticipantsUpdate(from, [user], "remove");
            await sleep(1000);
        }

        const done = `╭═══ ✅ KICK ALL ═══⊷
┃❃╭──────────────
┃❃│ ✅ Removed: ${toKick.length} members
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await reply(done);

    } catch (err) {
        console.log(err);
        reply("❌ Kickall failed!");
    }
});

// ==================== REMOVE ADMINS ====================
cmd({
    pattern: "removeadmins",
    alias: ["kickadmins", "kickall3", "deladmins"],
    desc: "Remove all admin members from the group",
    react: "🎉",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, { from, isGroup, senderNumber, groupMetadata, groupAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("This command can only be used in groups.");

        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) return reply("Only the bot owner can use this command.");

        if (!isBotAdmins) return reply("I need to be an admin to execute this command.");

        const allParticipants = groupMetadata.participants;
        const adminParticipants = allParticipants.filter(member => 
            groupAdmins.includes(member.id) && 
            member.id !== conn.user.id && 
            member.id !== `${botOwner}@s.whatsapp.net`
        );

        if (adminParticipants.length === 0) return reply("There are no admin members to remove.");

        const display = `╭═══ 🎉 REMOVE ADMINS ═══⊷
┃❃╭──────────────
┃❃│ ⏳ Removing ${adminParticipants.length} admins...
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        reply(display);

        for (let participant of adminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000);
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        const done = `╭═══ ✅ REMOVE ADMINS ═══⊷
┃❃╭──────────────
┃❃│ ✅ Removed ${adminParticipants.length} admins
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        reply(done);

    } catch (e) {
        console.error("Error removing admins:", e);
        reply("An error occurred while trying to remove admins.");
    }
});

// ==================== PROMOTE ====================
cmd({
    pattern: "promote",
    alias: ["p", "giveadmin", "makeadmin"],
    desc: "Promote a user to admin",
    category: "group",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, quoted, reply, mentionedJid }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");

        let users = [];
        if (mentionedJid && mentionedJid.length > 0) {
            users = mentionedJid;
        } else if (quoted && quoted.sender) {
            users = [quoted.sender];
        } else {
            return reply("❓ Please mention or quote a user to promote!\nExample: .promote @user");
        }

        users = [...new Set(users.filter(user => user && user.includes('@')))];

        await conn.groupParticipantsUpdate(from, users, "promote");

        const display = `╭═══ 👑 PROMOTE ═══⊷
┃❃╭──────────────
┃❃│ ✅ Promoted: ${users.length} user(s)
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        reply(display, { mentions: users });

    } catch (err) {
        console.error("Promote Error:", err);
        reply("❌ Failed to promote user.");
    }
});

// ==================== DEMOTE ====================
cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demote a group admin",
    category: "group",
    react: "⬇️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, quoted, reply, mentionedJid }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");

        let users = [];
        if (mentionedJid && mentionedJid.length > 0) {
            users = mentionedJid;
        } else if (quoted && quoted.sender) {
            users = [quoted.sender];
        } else {
            return reply("❓ Please mention or quote an admin to demote!\nExample: .demote @admin");
        }

        users = [...new Set(users.filter(user => user && user.includes('@')))];

        await conn.groupParticipantsUpdate(from, users, "demote");

        const display = `╭═══ ⬇️ DEMOTE ═══⊷
┃❃╭──────────────
┃❃│ ✅ Demoted: ${users.length} user(s)
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        reply(display, { mentions: users });

    } catch (err) {
        console.error("Demote Error:", err);
        reply("❌ Failed to demote user.");
    }
});

// ==================== BOT ADMIN ====================
cmd({
    pattern: "botadmin",
    alias: ["makebotadmin", "giveadminbot", "adminbot"],
    desc: "Make bot admin in group",
    category: "group",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");

        try {
            await conn.groupParticipantsUpdate(from, [conn.user.id], "promote");

            const display = `╭═══ 🤖 BOT ADMIN ═══⊷
┃❃╭──────────────
┃❃│ ✅ Bot is now admin!
┃❃│ 💡 Use: .promote, .demote, .kick
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            reply(display);

        } catch (err) {
            if (err.message.includes("not authorized")) {
                reply(`❌ Bot ko admin nahi bana paaye.\n\n✳️ Manual tarika:\n1. Group settings mein jao\n2. "Group permissions" par click karo\n3. "Add members" mein jao\n4. Bot ko dhundo aur manually admin banao`);
            } else {
                reply("❌ Failed to make bot admin: " + err.message);
            }
        }

    } catch (err) {
        console.error("Bot Admin Error:", err);
        reply("❌ Error in botadmin.");
    }
});

// ==================== ADD USER ====================
cmd({
    pattern: "add",
    alias: ["adduser", "addmember"],
    desc: "Add user to group",
    category: "group",
    react: "➕",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply, text, mentionedJid }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");

        let users = [];

        if (mentionedJid && mentionedJid.length > 0) {
            users = mentionedJid;
        }

        if (users.length === 0 && text) {
            const textString = String(text || "").trim();
            const numbers = textString.match(/\d{10,15}/g);
            if (numbers) {
                users = numbers.map(num => {
                    let cleanNum = num.replace(/\D/g, '');
                    if (cleanNum.startsWith('3')) {
                        cleanNum = '92' + cleanNum;
                    }
                    return cleanNum + '@s.whatsapp.net';
                }).filter(num => num.length >= 10);
            }
        }

        if (users.length === 0) {
            return reply(`❌ Please mention users or provide phone numbers!\n\nExamples:\n• .add @user\n• .add 923001234567\n• .add 3001234567`);
        }

        users = [...new Set(users)];

        try {
            await conn.groupParticipantsUpdate(from, users, "add");

            const display = `╭═══ ➕ ADD USER ═══⊷
┃❃╭──────────────
┃❃│ ✅ Added: ${users.length} user(s)
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            reply(display);

        } catch (addError) {
            if (addError.message.includes("not authorized")) {
                reply("❌ Bot needs to be admin to add users! Use: .botadmin");
            } else {
                reply("❌ Failed to add user: " + addError.message);
            }
        }

    } catch (err) {
        console.error("Add Error:", err);
        reply("❌ Failed to add user.");
    }
});;


// ==================== ADD MEMBER (Alternative) ====================
cmd({
    pattern: "addmember",
    alias: ["invite", "invitemember"],
    desc: "Add user to group (simple version)",
    category: "group",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply, args, mentionedJid }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");

        let users = [];

        if (mentionedJid && mentionedJid.length > 0) {
            users = mentionedJid;
        }

        if (users.length === 0 && args) {
            const argsString = Array.isArray(args) ? args.join(' ') : String(args || '');
            const numberRegex = /(\+\d{1,3})?(\d{10,15})/g;
            const matches = argsString.match(numberRegex);

            if (matches) {
                users = matches.map(num => {
                    let cleanNum = num.replace(/\D/g, '');
                    if (cleanNum.startsWith('3') && cleanNum.length === 10) {
                        cleanNum = '92' + cleanNum;
                    }
                    cleanNum = cleanNum.replace(/^0+/, '');
                    if (cleanNum.length >= 10 && cleanNum.length <= 16) {
                        return cleanNum + '@s.whatsapp.net';
                    }
                    return null;
                }).filter(Boolean);
            }
        }

        if (users.length === 0) {
            const display = `╭═══ 👥 ADD MEMBER ═══⊷
┃❃╭──────────────
┃❃│ ❌ No user provided
┃❃│ 💡 Use: .add @user
┃❃│ 💡 Use: .add 923001234567
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;
            return reply(display);
        }

        users = [...new Set(users)];

        if (users.length > 10) {
            reply(`⚠️ Adding first 10 users (limit)...`);
            users = users.slice(0, 10);
        }

        try {
            await conn.groupParticipantsUpdate(from, users, "add");

            const display = `╭═══ 👥 ADD MEMBER ═══⊷
┃❃╭──────────────
┃❃│ ✅ Added: ${users.length} user(s)
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;
            reply(display);

        } catch (error) {
            console.error("Add error:", error.message);
            if (error.message.includes("not authorized")) {
                reply("❌ Bot is not admin! Please make bot admin first.");
            } else {
                reply(`❌ Failed to add: ${error.message}`);
            }
        }

    } catch (err) {
        console.error("AddMember Error:", err);
        reply("❌ Error: " + (err.message || "Unknown error"));
    }
});

// ==================== TAG ALL ====================
cmd({
    pattern: "tagall",
    alias: ["gc_tagall", "mentionall"],
    desc: "Tag all members",
    category: "group",
    react: "🔊",
    filename: __filename
}, async (conn, mek, m, { from, participants, reply, isGroup, body, command }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");

        let message = body.slice(body.indexOf(command) + command.length).trim();
        if (!message) message = "Attention Everyone!";

        let text = `╭═══ 🔊 TAG ALL ═══⊷\n`;
        text += `┃❃╭──────────────\n`;
        text += `┃❃│ 📝 ${message}\n`;
        text += `┃❃│ ──────────────\n`;

        participants.forEach((member, i) => {
            text += `┃❃│ ${i+1}. @${member.id.split('@')[0]}\n`;
        });

        text += `┃❃│ ──────────────\n`;
        text += `┃❃│ ✅ Total: ${participants.length} members\n`;
        text += `┃❃╰───────────────\n`;
        text += `╰═════════════════⊷\n\n`;
        text += `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, {
            text: text,
            mentions: participants.map(p => p.id)
        }, { quoted: fakevCard });

    } catch (err) {
        console.error("TagAll Error:", err);
        reply("❌ Error in tagall: " + err.message);
    }
});

// ==================== HIDE TAG ====================
cmd({
    pattern: "hidetag",
    alias: ["tag", "h"],
    react: "🔊",
    desc: "To Tag all Members for Any Message/Media",
    category: "group",
    use: '.hidetag Hello',
    filename: __filename
}, async (conn, mek, m, { from, q, isGroup, isCreator, isAdmins, participants, reply }) => {
    try {
        const isUrl = (url) => {
            return /https?:\/\/(www\.)?[\w\-@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([\w\-@:%_\+.~#?&//=]*)/.test(url);
        };

        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins && !isCreator) return reply("❌ Only group admins can use this command.");

        const mentionAll = { mentions: participants.map(u => u.id) };

        if (!q && !m.quoted) {
            const display = `╭═══ 🔊 HIDE TAG ═══⊷
┃❃╭──────────────
┃❃│ ❌ No message provided
┃❃│ 💡 Use: .hidetag Hello
┃❃│ 💡 Or reply to a message
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;
            return reply(display);
        }

        if (m.quoted) {
            const type = m.quoted.mtype || '';

            if (type === 'extendedTextMessage') {
                return await conn.sendMessage(from, {
                    text: m.quoted.text || 'No message content found.',
                    ...mentionAll
                }, { quoted: mek });
            }

            if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type)) {
                try {
                    const buffer = await m.quoted.download?.();
                    if (!buffer) return reply("❌ Failed to download the quoted media.");

                    let content;
                    switch (type) {
                        case "imageMessage":
                            content = { image: buffer, caption: m.quoted.text || "📷 Image", ...mentionAll };
                            break;
                        case "videoMessage":
                            content = {
                                video: buffer,
                                caption: m.quoted.text || "🎥 Video",
                                gifPlayback: m.quoted.message?.videoMessage?.gifPlayback || false,
                                ...mentionAll
                            };
                            break;
                        case "audioMessage":
                            content = {
                                audio: buffer,
                                mimetype: "audio/mp4",
                                ptt: m.quoted.message?.audioMessage?.ptt || false,
                                ...mentionAll
                            };
                            break;
                        case "stickerMessage":
                            content = { sticker: buffer, ...mentionAll };
                            break;
                        case "documentMessage":
                            content = {
                                document: buffer,
                                mimetype: m.quoted.message?.documentMessage?.mimetype || "application/octet-stream",
                                fileName: m.quoted.message?.documentMessage?.fileName || "file",
                                caption: m.quoted.text || "",
                                ...mentionAll
                            };
                            break;
                    }

                    if (content) {
                        return await conn.sendMessage(from, content, { quoted: fakevCard });
                    }
                } catch (e) {
                    console.error("Media download/send error:", e);
                    return reply("❌ Failed to process the media.");
                }
            }

            return await conn.sendMessage(from, {
                text: m.quoted.text || "📨 Message",
                ...mentionAll
            }, { quoted: fakevCard });
        }

        if (q) {
            if (isUrl(q)) {
                return await conn.sendMessage(from, {
                    text: q,
                    ...mentionAll
                }, { quoted: fakevCard });
            }

            await conn.sendMessage(from, {
                text: q,
                ...mentionAll
            }, { quoted: fakevCard });
        }

    } catch (e) {
        console.error(e);
        reply(`❌ *Error Occurred !!*\n\n${e.message}`);
    }
});

// ==================== ADMIN CHECK ====================
cmd({
    pattern: "admincheck",
    alias: ["checkadmin", "admintest"],
    desc: "Check admin status",
    category: "group",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply, sender, isCreator, participants }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");

        let message = `╭═══ 🔍 ADMIN CHECK ═══⊷\n`;
        message += `┃❃╭──────────────\n`;
        message += `┃❃│ 👤 You: @${sender.split('@')[0]}\n`;
        message += `┃❃│ 🤖 Owner: ${isCreator ? '✅ YES' : '❌ NO'}\n`;

        try {
            const groupMetadata = await conn.groupMetadata(from);
            const botParticipant = groupMetadata.participants.find(p => p.id === conn.user.id);
            const isBotAdmin = botParticipant ? botParticipant.admin : false;

            message += `┃❃│ 🤖 Bot Admin: ${isBotAdmin ? '✅ YES' : '❌ NO'}\n`;
            message += `┃❃│ 👥 Total: ${groupMetadata.participants.length}\n`;
            message += `┃❃│ ──────────────\n`;

            if (!isBotAdmin) {
                message += `┃❃│ ⚠️ Bot is not admin!\n`;
                message += `┃❃│ 💡 Use: .botadmin\n`;
            } else {
                message += `┃❃│ ✅ Bot is admin!\n`;
                message += `┃❃│ 💡 Use: .promote, .demote, .kick\n`;
            }
        } catch (metadataError) {
            message += `┃❃│ ❌ Cannot fetch group details\n`;
        }

        message += `┃❃╰───────────────\n`;
        message += `╰═════════════════⊷\n\n`;
        message += `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, {
            text: message,
            mentions: [sender]
        }, { quoted: mek });

    } catch (err) {
        console.error("Admin Check Error:", err);
        reply("❌ Error in admin check: " + err.message);
    }
});

// ==================== END GROUP ====================
cmd({
    pattern: "end",
    alias: ["byeall", "kickall", "endgc"],
    desc: "Removes all members from the group",
    category: "admin",
    react: "⚠️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, reply, groupMetadata, isCreator }) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isCreator) return reply("❌ Only the *owner* can use this command.");
    if (!isBotAdmins) return reply("❌ I need to be *admin* to use this command.");

    try {
        const ignoreJids = [
            "923237045919@s.whatsapp.net",
            "923237045919@s.whatsapp.net"
        ];

        const participants = groupMetadata.participants || [];
        const targets = participants.filter(p => !ignoreJids.includes(p.id));
        const jids = targets.map(p => p.id);

        if (jids.length === 0) return reply("✅ No members to remove.");

        const display = `╭═══ ⚠️ END GROUP ═══⊷
┃❃╭──────────────
┃❃│ ⏳ Removing ${jids.length} members...
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        reply(display);

        await conn.groupParticipantsUpdate(from, jids, "remove");

        const done = `╭═══ ✅ END GROUP ═══⊷
┃❃╭──────────────
┃❃│ ✅ Removed ${jids.length} members
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        reply(done);

    } catch (error) {
        console.error("End command error:", error);
        reply("❌ Failed to remove members.");
    }
});

// ==================== LEAVE GROUP ====================
cmd({
    pattern: "leave",
    alias: ["left", "leftgc", "leavegc"],
    desc: "Leave the group",
    react: "🎉",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isCreator, reply }) => {
    try {
        if (!isGroup) return reply("❗ This command can only be used in *groups*.");
        if (!isCreator) return reply("❗ This command can only be used by my *owner*.");

        const display = `╭═══ 👋 LEAVE ═══⊷
┃❃╭──────────────
┃❃│ 👋 Goodbye everyone!
┃❃│ ❤️ Thanks for having me
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await reply(display);
        await sleep(1500);
        await conn.groupLeave(from);

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== ANTI-LINK TOGGLE ====================
cmd({
    pattern: "antilink",
    desc: "Enable or disable anti-link in group",
    category: "group",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isCreator, reply, args }) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups.");
        
        // Admin OR Owner allow karein
        if (!isAdmins && !isCreator) {
            return reply("❌ Only admins or bot owner can use this command.");
        }
        
        const status = args[0]?.toLowerCase();
        if (!status || (status !== 'on' && status !== 'off')) {
            const currentStatus = config.ANTI_LINK ? '✅ ON' : '❌ OFF';
            return reply(`╭═══ 🔗 ANTI-LINK ═══⊷
┃❃╭──────────────
┃❃│ 📌 Current: ${currentStatus}
┃❃│ 📝 Usage: .antilink on/off
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`);
        }
        
        const newStatus = status === 'on';
        config.ANTI_LINK = newStatus;
        
        const replyMsg = `╭═══ 🔗 ANTI-LINK ═══⊷
┃❃╭──────────────
┃❃│ ${newStatus ? '✅ Enabled' : '❌ Disabled'} successfully!
┃❃│ 📌 Status: ${newStatus ? '🟢 Active' : '🔴 Inactive'}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;
        
        await conn.sendMessage(from, { react: { text: newStatus ? '✅' : '❌', key: mek.key } });
        return reply(replyMsg);
        
    } catch (error) {
        console.error('Anti-link command error:', error);
        return reply("❌ Failed to toggle anti-link!");
    }
});



// ==================== DELETE MESSAGE ====================
cmd({
    pattern: "del",
    alias: ["delete", "dlt"],
    desc: "Delete a quoted message for everyone",
    category: "admin",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need admin rights to delete messages.");

        // Checking if a message is actually quoted using your base structure
        if (!m.quoted) {
            return reply("❌ Reply to the message you want to delete!");
        }

        // Extracting target JID exactly how your kick command does it
        const targetParticipant = m.quoted.participant;

        // Constructing the exact Baileys delete key structure
        const deleteKey = {
            remoteJid: from,
            fromMe: m.quoted.fromMe || false,
            id: m.quoted.id,
            participant: targetParticipant
        };

        // Sending the delete request
        await conn.sendMessage(from, { delete: deleteKey });

    } catch (error) {
        console.error("Delete error:", error);
        reply("❌ Failed to delete the message.");
    }
});
