const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const { updateUserConfig } = require('../lib/database');

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

// Helper function to update config
const updateConfig = async (key, value, botNumber, config, reply) => {
    try {
        config[key] = value;
        const newConfig = { ...config };
        newConfig[key] = value;
        await updateUserConfig(botNumber, newConfig);
        return reply(`✅ *${key}* ${toFancy('Updated To')}: *${value}*`);
    } catch (e) {
        console.error(e);
        return reply("❌ ${toFancy('Error Saving')}");
    }
};

// ============================================================
// 1. AUTO RECORDING
// ============================================================
cmd({
    pattern: "autorecording",
    alias: ["autorec", "arecording"],
    desc: "Enable/Disable auto recording",
    category: "settings",
    react: "👑"
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 😎`);
    const value = args[0]?.toLowerCase();
    
    if (value === 'on' || value === 'true') {
        await updateConfig('AUTO_RECORDING', 'true', botNumber, config, reply);
    } else if (value === 'off' || value === 'false') {
        await updateConfig('AUTO_RECORDING', 'false', botNumber, config, reply);
    } else {
        reply(`╭─── ${toFancy('Auto Recording')} ───╮\n│ ${toFancy('Status')}: ${config.AUTO_RECORDING}\n│ ${toFancy('Use')}: .autorec on/off\n╰────────────────────────╯`);
    }
});

// ============================================================
// 2. AUTO TYPING
// ============================================================
cmd({
    pattern: "autotyping",
    alias: ["autotype", "atyping"],
    desc: "Enable/Disable auto typing",
    category: "settings",
    react: "👑"
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 😎`);
    const value = args[0]?.toLowerCase();
    
    if (value === 'on' || value === 'true') {
        await updateConfig('AUTO_TYPING', 'true', botNumber, config, reply);
    } else if (value === 'off' || value === 'false') {
        await updateConfig('AUTO_TYPING', 'false', botNumber, config, reply);
    } else {
        reply(`╭─── ${toFancy('Auto Typing')} ───╮\n│ ${toFancy('Status')}: ${config.AUTO_TYPING}\n│ ${toFancy('Use')}: .autotype on/off\n╰────────────────────────╯`);
    }
});

// ============================================================
// 3. ANTI CALL
// ============================================================
cmd({
    pattern: "anticall",
    alias: "acall",
    desc: "Auto reject calls",
    category: "settings",
    react: "👑"
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 😎`);
    const value = args[0]?.toLowerCase();
    
    if (value === 'on' || value === 'true') {
        await updateConfig('ANTI_CALL', 'true', botNumber, config, reply);
    } else if (value === 'off' || value === 'false') {
        await updateConfig('ANTI_CALL', 'false', botNumber, config, reply);
    } else {
        reply(`╭─── ${toFancy('Anti Call')} ───╮\n│ ${toFancy('Status')}: ${config.ANTI_CALL}\n│ ${toFancy('Use')}: .anticall on/off\n╰────────────────────────╯`);
    }
});

// ============================================================
// 4. WELCOME
// ============================================================
cmd({
    pattern: "welcome",
    desc: "Enable/Disable welcome messages",
    category: "settings",
    react: "👑"
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 😎`);
    const value = args[0]?.toLowerCase();
    
    if (value === 'on' || value === 'true') {
        await updateConfig('WELCOME', 'true', botNumber, config, reply);
    } else if (value === 'off' || value === 'false') {
        await updateConfig('WELCOME', 'false', botNumber, config, reply);
    } else {
        reply(`╭─── ${toFancy('Welcome')} ───╮\n│ ${toFancy('Status')}: ${config.WELCOME}\n│ ${toFancy('Use')}: .welcome on/off\n╰────────────────────────╯`);
    }
});

// ============================================================
// 5. GOODBYE
// ============================================================
cmd({
    pattern: "goodbye",
    desc: "Enable/Disable goodbye messages",
    category: "settings",
    react: "👑"
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 😎`);
    const value = args[0]?.toLowerCase();
    
    if (value === 'on' || value === 'true') {
        await updateConfig('GOODBYE', 'true', botNumber, config, reply);
    } else if (value === 'off' || value === 'false') {
        await updateConfig('GOODBYE', 'false', botNumber, config, reply);
    } else {
        reply(`╭─── ${toFancy('Goodbye')} ───╮\n│ ${toFancy('Status')}: ${config.GOODBYE}\n│ ${toFancy('Use')}: .goodbye on/off\n╰────────────────────────╯`);
    }
});

// ============================================================
// 6. AUTO READ (Blue Tick)
// ============================================================
cmd({
    pattern: "autoread",
    desc: "Enable/Disable auto read (Blue Tick)",
    category: "settings",
    react: "👀"
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 😎`);
    const value = args[0]?.toLowerCase();
    
    if (value === 'on' || value === 'true') {
        await updateConfig('READ_MESSAGE', 'true', botNumber, config, reply);
    } else if (value === 'off' || value === 'false') {
        await updateConfig('READ_MESSAGE', 'false', botNumber, config, reply);
    } else {
        reply(`╭─── ${toFancy('Auto Read')} ───╮\n│ ${toFancy('Status')}: ${config.READ_MESSAGE}\n│ ${toFancy('Use')}: .autoread on/off\n╰────────────────────────╯`);
    }
});

// ============================================================
// 7. AUTO VIEW STATUS
// ============================================================
cmd({
    pattern: "autoviewsview",
    alias: ["avs", "statusseen", "astatus"],
    desc: "Auto view status updates",
    category: "settings",
    react: "😎"
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 😎`);
    const value = args[0]?.toLowerCase();
    
    if (value === 'on' || value === 'true') {
        await updateConfig('AUTO_VIEW_STATUS', 'true', botNumber, config, reply);
    } else if (value === 'off' || value === 'false') {
        await updateConfig('AUTO_VIEW_STATUS', 'false', botNumber, config, reply);
    } else {
        reply(`╭─── ${toFancy('Auto View Status')} ───╮\n│ ${toFancy('Status')}: ${config.AUTO_VIEW_STATUS}\n│ ${toFancy('Use')}: .avs on/off\n╰────────────────────────╯`);
    }
});

// ============================================================
// 8. AUTO LIKE STATUS
// ============================================================
cmd({
    pattern: "autolikestatus",
    alias: ["als"],
    desc: "Auto like status updates",
    category: "settings",
    react: "❤️"
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 🚫`);
    const value = args[0]?.toLowerCase();
    
    if (value === 'on' || value === 'true') {
        await updateConfig('AUTO_LIKE_STATUS', 'true', botNumber, config, reply);
    } else if (value === 'off' || value === 'false') {
        await updateConfig('AUTO_LIKE_STATUS', 'false', botNumber, config, reply);
    } else {
        reply(`╭─── ${toFancy('Auto Like Status')} ───╮\n│ ${toFancy('Status')}: ${config.AUTO_LIKE_STATUS}\n│ ${toFancy('Use')}: .als on/off\n╰────────────────────────╯`);
    }
});

// ============================================================
// 9. MODE
// ============================================================
cmd({
    pattern: "mode",
    desc: "Change bot mode",
    category: "settings",
    react: "⚙️"
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 😎`);
    const mode = args[0]?.toLowerCase();
    const validModes = ['public', 'private', 'groups', 'inbox'];

    if (validModes.includes(mode)) {
        await updateConfig('WORK_TYPE', mode, botNumber, config, reply);
    } else {
        reply(`╭─── ${toFancy('Available Modes')} ───╮\n│ ${validModes.join('\n│ ')}\n│ ${toFancy('Current')}: ${config.WORK_TYPE}\n╰────────────────────────╯`);
    }
});

// ============================================================
// 10. SET PREFIX
// ============================================================
cmd({
    pattern: "setprefix",
    desc: "Change bot prefix",
    category: "settings",
    react: "👑"
}, async (conn, mek, m, { args, isOwner, reply, botNumber, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 😎`);
    const newPrefix = args[0];

    if (newPrefix) {
        if (newPrefix.length > 1 && newPrefix !== 'noprefix') return reply(`${toFancy('Prefix must be short')} ❌`);
        await updateConfig('PREFIX', newPrefix, botNumber, config, reply);
    } else {
        reply(`╭─── ${toFancy('Current Prefix')} ───╮\n│ ${toFancy('Prefix')}: ${config.PREFIX}\n│ ${toFancy('Use')}: .setprefix . or !\n╰────────────────────────╯`);
    }
});

// ============================================================
// 11. VIEW ALL SETTINGS
// ============================================================
cmd({
    pattern: "allsettings",
    alias: ["settings", "config"],
    desc: "View all bot settings",
    category: "settings",
    react: "⚙️"
}, async (conn, mek, m, { isOwner, reply, config }) => {
    if (!isOwner) return reply(`${toFancy('Owner Only')} 😎`);
    
    const settings = `╭─── ${toFancy('All Settings')} ───╮\n│ ${toFancy('Bot Name')}: 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪\n│ ${toFancy('Prefix')}: ${config.PREFIX}\n│ ${toFancy('Mode')}: ${config.WORK_TYPE}\n│ ${toFancy('Auto Recording')}: ${config.AUTO_RECORDING}\n│ ${toFancy('Auto Typing')}: ${config.AUTO_TYPING}\n│ ${toFancy('Anti Call')}: ${config.ANTI_CALL}\n│ ${toFancy('Welcome')}: ${config.WELCOME}\n│ ${toFancy('Goodbye')}: ${config.GOODBYE}\n│ ${toFancy('Auto Read')}: ${config.READ_MESSAGE}\n│ ${toFancy('Auto View Status')}: ${config.AUTO_VIEW_STATUS}\n│ ${toFancy('Auto Like Status')}: ${config.AUTO_LIKE_STATUS}\n╰────────────────────────╯`;
    
    reply(settings);
});