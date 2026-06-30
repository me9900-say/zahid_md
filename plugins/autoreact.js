const { cmd } = require('../zaidi');
const { getAutoreactSettings, setAutoreactSettings } = require('../data/autoreactDB');

cmd({
    pattern: "autoreact",
    desc: "Auto-react on/off",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, senderNumber, reply }) => {
    const args = m.text.split(' ').slice(1);
    const action = args[0]?.toLowerCase();
    const settings = await getAutoreactSettings(senderNumber);

    if (!action) {
        return reply(`📌 *Status*\nEnabled: ${settings.enabled ? '✅' : '❌'}\nGroup: ${settings.groupReact ? '✅' : '❌'}\nCmdOnly: ${settings.cmdOnly ? '✅' : '❌'}\n\n.autoreact on/off\n.autoreact group on/off\n.autoreact cmdonly on/off`);
    }

    if (action === 'on' || action === 'off') {
        settings.enabled = action === 'on';
        await setAutoreactSettings(senderNumber, settings);
        return reply(`✅ Auto-react ${action === 'on' ? 'on' : 'off'}`);
    }
    if (action === 'group' && args[1]) {
        settings.groupReact = args[1] === 'on';
        await setAutoreactSettings(senderNumber, settings);
        return reply(`✅ Group ${args[1] === 'on' ? 'on' : 'off'}`);
    }
    if (action === 'cmdonly' && args[1]) {
        settings.cmdOnly = args[1] === 'on';
        await setAutoreactSettings(senderNumber, settings);
        return reply(`✅ CmdOnly ${args[1] === 'on' ? 'on' : 'off'}`);
    }
    reply('❌ Wrong command');
});
