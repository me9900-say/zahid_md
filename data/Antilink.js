// data/Antilink.js
// MongoDB models for Antilink and AutoReact features
// Place this file in: data/Antilink.js

const mongoose = require('mongoose');

// ==================== ANTILINK MODEL ====================
const antilinkSchema = new mongoose.Schema({
    chatId:   { type: String, required: true, unique: true },
    enabled:  { type: Boolean, default: false },
    maxWarns: { type: Number, default: 2 }
});
const Antilink = mongoose.model('Antilink', antilinkSchema);

const getAntilinkSettings = async (chatId) => {
    try {
        const data = await Antilink.findOne({ chatId });
        return data ? { enabled: data.enabled, maxWarns: data.maxWarns } : { enabled: false, maxWarns: 2 };
    } catch (e) { return { enabled: false, maxWarns: 2 }; }
};

const setAntilinkSettings = async (chatId, enabled, maxWarns = 2) => {
    try {
        await Antilink.findOneAndUpdate({ chatId }, { enabled, maxWarns }, { upsert: true, new: true });
        return true;
    } catch (e) { return false; }
};

// ==================== AUTOREACT MODEL ====================
const autoreactSchema = new mongoose.Schema({
    userId:   { type: String, required: true, unique: true }, // bot number
    enabled:  { type: Boolean, default: false },
    groupReact: { type: Boolean, default: true },
    inboxReact: { type: Boolean, default: true },
    cmdOnly:  { type: Boolean, default: false },
    emojis:   { type: Array, default: ['❤️', '😍', '🔥', '👑', '💫', '✨', '😎', '🤩', '💕', '🌹'] }
});
const Autoreact = mongoose.model('Autoreact', autoreactSchema);

const getAutoreactSettings = async (userId) => {
    try {
        const data = await Autoreact.findOne({ userId });
        return data ? {
            enabled: data.enabled,
            groupReact: data.groupReact,
            inboxReact: data.inboxReact,
            cmdOnly: data.cmdOnly,
            emojis: data.emojis && data.emojis.length ? data.emojis : ['❤️', '😍', '🔥', '👑', '💫', '✨', '😎', '🤩', '💕', '🌹']
        } : { enabled: false, groupReact: true, inboxReact: true, cmdOnly: false, emojis: ['❤️', '😍', '🔥', '👑', '💫', '✨', '😎', '🤩', '💕', '🌹'] };
    } catch (e) { return { enabled: false, groupReact: true, inboxReact: true, cmdOnly: false, emojis: ['❤️', '😍', '🔥', '👑', '💫'] }; }
};

const setAutoreactSettings = async (userId, settings) => {
    try {
        await Autoreact.findOneAndUpdate({ userId }, settings, { upsert: true, new: true });
        return true;
    } catch (e) { return false; }
};

// Warn map in memory (resets on restart — sufficient for WhatsApp bots)
const warnMap = new Map();

const getWarn = (chatId, sender) => warnMap.get(`${chatId}_${sender}`) || 0;
const setWarn = (chatId, sender, count) => warnMap.set(`${chatId}_${sender}`, count);
const clearWarn = (chatId, sender) => warnMap.delete(`${chatId}_${sender}`);
const clearAllWarns = (chatId) => {
    for (const key of warnMap.keys()) {
        if (key.startsWith(chatId + '_')) warnMap.delete(key);
    }
};

module.exports = {
    Antilink,
    getAntilinkSettings,
    setAntilinkSettings,
    Autoreact,
    getAutoreactSettings,
    setAutoreactSettings,
    getWarn,
    setWarn,
    clearWarn,
    clearAllWarns
};
