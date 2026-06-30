// plugins/antilink.js
const { cmd } = require('../zaidi');
const { getAntilinkSettings, setAntilinkSettings } = require('../data/Antilink');

function toFancy(text) {
    const map = { 'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ' };
    return text.toLowerCase().split('').map(c => map[c] || c).join('');
}

// ✅ Bot admin check — fresh group metadata se, reliable tarika
async function isBotAdmin(conn, from) {
    try {
        const meta = await conn.groupMetadata(from);
        const rawId = conn.user.id;
        // Format: 923xxxxxxx@s.whatsapp.net
        const botJid = rawId.includes(':') ? rawId.split(':')[0] + '@s.whatsapp.net' : rawId;
        return meta.participants.some(p =>
            p.id === botJid && (p.admin === 'admin' || p.admin === 'superadmin')
        );
    } catch (_) {
        return false;
    }
}

cmd({
    pattern: 'antilink',
    alias: ['alink', 'antil'],
    desc: 'Group mein links delete karne ka feature on/off karo',
    category: 'group',
    react: '🔗',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, args, isOwner, reply }) => {

    if (!isGroup) return reply(`❌ ${toFancy('Yeh command sirf group mein kaam karti hai')}`);
    if (!isAdmins && !isOwner) return reply(`❌ ${toFancy('Sirf group admins use kar sakte hain')}`);

    const value = args[0]?.toLowerCase();
    const current = await getAntilinkSettings(from);

    // ✅ Fresh check — passed isBotAdmins par rely nahi karte
    const botAdminStatus = await isBotAdmin(conn, from);

    if (value === 'on') {
        await setAntilinkSettings(from, true, current.maxWarns || 2);
        return reply(
`╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 🔗 ${toFancy('Anti Link')}
┃❃│ ✅ ${toFancy('Status')}: ${toFancy('Activated')}
┃❃│ ⚠️ ${toFancy('Max Warns')}: ${current.maxWarns || 2}
┃❃│ 🤖 ${toFancy('Bot Admin')}: ${botAdminStatus ? toFancy('Yes — Delete Works') : toFancy('No — Make Bot Admin!')}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    } else if (value === 'off') {
        await setAntilinkSettings(from, false, current.maxWarns || 2);
        return reply(
`╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 🔗 ${toFancy('Anti Link')}
┃❃│ ❌ ${toFancy('Status')}: ${toFancy('Deactivated')}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    } else if (value === 'warns') {
        const num = parseInt(args[1]);
        if (!num || num < 1) return reply(`❌ Example: .antilink warns 3`);
        await setAntilinkSettings(from, current.enabled, num);
        return reply(`✅ ${toFancy('Max Warns Set To')}: *${num}*`);
    } else {
        return reply(
`╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 🔗 ${toFancy('Anti Link Status')}
┃❃│ ${current.enabled ? '✅' : '❌'} ${toFancy('Status')}: ${current.enabled ? toFancy('On') : toFancy('Off')}
┃❃│ ⚠️ ${toFancy('Max Warns')}: ${current.maxWarns || 2}
┃❃│ 🤖 ${toFancy('Bot Admin')}: ${botAdminStatus ? toFancy('Yes ✅') : toFancy('No — Needed!')}
┃❃│ ──────────────
┃❃│ 💡 ${toFancy('Commands')}:
┃❃│ .antilink on
┃❃│ .antilink off
┃❃│ .antilink warns 3
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`
        );
    }
});
