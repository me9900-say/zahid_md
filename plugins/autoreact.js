// =============================================
// ZAIDI-MD — autoreact.js (FIXED)
// Fix: m.text → m.body (Bug #5)
// =============================================

const { cmd } = require('../zaidi');
const { getAutoreactSettings, setAutoreactSettings } = require('../data/autoreactDB');

cmd({
    pattern: "autoreact",
    desc: "Auto-react on/off karein",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, senderNumber, reply, body }) => {

    // BUG #5 FIX: 'm.text' undefined tha kyunke msg.js mein 'm.body' set hoti hai.
    // Pehle: const args = m.text.split(' ').slice(1);  ← CRASH HOTA THA
    // Fix: 'body' parameter use karo jo main.js se directly aata hai:
    const args = body ? body.split(' ').slice(1) : [];
    const action = args[0]?.toLowerCase();
    const settings = await getAutoreactSettings(senderNumber);

    if (!action) {
        return reply(
`📌 *Auto-React Status*

✅ Enabled: ${settings.enabled ? '✅ On' : '❌ Off'}
👥 Group: ${settings.groupReact ? '✅ On' : '❌ Off'}
🤖 CmdOnly: ${settings.cmdOnly ? '✅ On' : '❌ Off'}

*Commands:*
• .autoreact on / off
• .autoreact group on / off
• .autoreact cmdonly on / off`
        );
    }

    if (action === 'on' || action === 'off') {
        settings.enabled = action === 'on';
        await setAutoreactSettings(senderNumber, settings);
        return reply(`✅ Auto-react ${action === 'on' ? 'ON kar diya' : 'OFF kar diya'}`);
    }
    if (action === 'group' && args[1]) {
        settings.groupReact = args[1] === 'on';
        await setAutoreactSettings(senderNumber, settings);
        return reply(`✅ Group react ${args[1] === 'on' ? 'ON' : 'OFF'} kar diya`);
    }
    if (action === 'cmdonly' && args[1]) {
        settings.cmdOnly = args[1] === 'on';
        await setAutoreactSettings(senderNumber, settings);
        return reply(`✅ CmdOnly ${args[1] === 'on' ? 'ON' : 'OFF'} kar diya`);
    }

    reply('❌ Galat command. .autoreact on/off use karein');
});
