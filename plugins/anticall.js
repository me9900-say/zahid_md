const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "anti-call",
    alias: ["anticall"],
    desc: "📵 Auto reject calls",
    category: "owner",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {

    try {
        if (!isCreator) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: m.key }
            });
            return reply(`${toFancy('Owner Only')} 😎`);
        }

        await conn.sendMessage(from, {
            react: { text: "👑", key: m.key }
        });

        const status = args[0]?.toLowerCase();
        const msg = await conn.sendMessage(from, {
            text: `ᥫ᭡𝛧𝜜𝛪𝐷𝛪 𝛭𝐷 𝐵𝜣𝑇 𓆩 𝐀𝐍𝐓𝐈-𝐂𝐀𝐋𝐋 𓆪 ⏤͟͟͞͞🧸🌷`
        }, { quoted: mek });

        await sleep(1500);

        let display = '';

        if (status === "on") {
            config.ANTI_CALL = "true";
            display = `╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 📵 ${toFancy('Anti-Call')}
┃❃│ ✅ ${toFancy('Status')}: ${toFancy('Activated')}
┃❃│ 🔒 ${toFancy('All calls will be rejected')}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʑɑ͢ı֟፝𝛛֟ı֟፝-ϻ֟͡𝛛֟`;
        } else if (status === "off") {
            config.ANTI_CALL = "false";
            display = `╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 📵 ${toFancy('Anti-Call')}
┃❃│ ❌ ${toFancy('Status')}: ${toFancy('Deactivated')}
┃❃│ 🔓 ${toFancy('Calls will be accepted')}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʑɑ͢ı֟፝𝛛֟ı֟፝-ϻ֟͡𝛛֟`;
        } else {
            display = `╭═══ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 ═══⊷
┃❃╭──────────────
┃❃│ 📵 ${toFancy('Anti-Call')}
┃❃│ ⚠️ ${toFancy('Invalid Option')}
┃❃│ 💡 ${toFancy('Use')}: .anticall on/off
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʑɑ͢ı֟፝𝛛֟ı֟፝-ϻ֟͡𝛛֟`;
        }

        await conn.relayMessage(from, {
            protocolMessage: {
                key: msg.key,
                type: 14,
                editedMessage: {
                    conversation: display
                }
            }
        }, {});

        await sleep(1000);

        await conn.sendMessage(from, {
            react: { text: status === "on" ? "✅" : status === "off" ? "❌" : "⚠️", key: m.key }
        });

    } catch (e) {
        console.error("Anti-Call Error:", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ *Anti-Call failed!*");
    }
});

// 🎨 Fancy Font System
function toFancy(text) {
    const map = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ',
        'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ',
        'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
        's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x',
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toLowerCase().split('').map(char => map[char] || char).join('');
}