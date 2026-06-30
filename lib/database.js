const mongoose = require('mongoose');
const config = require('../config');

const connectdb = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(config.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ Database Connected Successfully");
    } catch (e) {
        console.error("❌ Database Connection Failed:", e.message);
    }
};

// ====================================
// SCHEMAS
// ====================================

const sessionSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true, index: true },
    credentials: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const userConfigSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true, index: true },
    config: {
        AUTO_RECORDING: { type: String, default: 'false' },
        AUTO_TYPING: { type: String, default: 'false' },
        ANTI_CALL: { type: String, default: 'false' },
        REJECT_MSG: { type: String, default: '*🔕 ʏᴏᴜʀ ᴄᴀʟʟ ᴡᴀs ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ʀᴇᴊᴇᴄᴛᴇᴅ..!*' },
        READ_MESSAGE: { type: String, default: 'false' },
        AUTO_VIEW_STATUS: { type: String, default: 'false' },
        AUTO_LIKE_STATUS: { type: String, default: 'false' },
        AUTO_STATUS_REPLY: { type: String, default: 'false' },
        AUTO_STATUS_MSG: { type: String, default: 'Hello from ZAIDI-MD' },
        AUTO_LIKE_EMOJI: { type: Array, default: ['❤️', '👍', '😮', '😎'] },
        ANTILINK_GROUPS: { type: Object, default: {} },
        AUTO_REACT: { type: String, default: 'false' },
        AUTO_REACT_GROUP: { type: String, default: 'true' },
        AUTO_REACT_INBOX: { type: String, default: 'true' },
        AUTO_REACT_CMD_ONLY: { type: String, default: 'false' },
        AUTO_REACT_EMOJIS: { type: Array, default: ['❤️', '😍', '🔥', '👑', '💫', '✨', '😎', '🤩', '💕', '🌹'] }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const otpSchema = new mongoose.Schema({
    number: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    config: { type: Object, required: true },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60000),
        index: { expires: '5m' }
    },
    createdAt: { type: Date, default: Date.now }
});

const activeNumberSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true, index: true },
    lastConnected: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    connectionInfo: { ip: String, userAgent: String, timestamp: Date }
});

const statsSchema = new mongoose.Schema({
    number: { type: String, required: true },
    date: { type: String, required: true },
    commandsUsed: { type: Number, default: 0 },
    messagesReceived: { type: Number, default: 0 },
    messagesSent: { type: Number, default: 0 },
    groupsInteracted: { type: Number, default: 0 }
});

// ===============================
// MODELS
// ===============================

const Session = mongoose.model('Session', sessionSchema);
const UserConfig = mongoose.model('UserConfig', userConfigSchema);
const OTP = mongoose.model('OTP', otpSchema);
const ActiveNumber = mongoose.model('ActiveNumber', activeNumberSchema);
const Stats = mongoose.model('Stats', statsSchema);

// ====================================
// FIX #1: IN-MEMORY CACHE
// Har message par MongoDB call hoti thi — ab 5 min cache se
// number of DB calls 90% kam ho jayenge
// ====================================

const configCache = new Map();
const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedConfig(number) {
    const entry = configCache.get(number);
    if (!entry) return null;
    if (Date.now() - entry.time > CONFIG_CACHE_TTL) {
        configCache.delete(number);
        return null;
    }
    return entry.data;
}

function setCachedConfig(number, data) {
    configCache.set(number, { data, time: Date.now() });
}

function clearCachedConfig(number) {
    configCache.delete(number);
}

// ====================================
// FUNCTIONS
// ====================================

async function saveSessionToMongoDB(number, credentials) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await Session.findOneAndUpdate(
            { number: cleanNumber },
            { credentials: credentials, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        return true;
    } catch (error) {
        console.error('❌ Error saving session to MongoDB:', error);
        return false;
    }
}

async function getSessionFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const session = await Session.findOne({ number: cleanNumber });
        return session ? session.credentials : null;
    } catch (error) {
        console.error('❌ Error getting session from MongoDB:', error);
        return null;
    }
}

// FIX #2: UserConfig bhi delete hogi logout par
// Pehle sirf Session aur ActiveNumber delete hoti thi
// Ab UserConfig bhi saaf hogi taake data ka pile up na ho
async function deleteSessionFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await Session.deleteOne({ number: cleanNumber });
        await ActiveNumber.deleteOne({ number: cleanNumber });
        await UserConfig.deleteOne({ number: cleanNumber });
        clearCachedConfig(cleanNumber);
        console.log(`🗑️ Session + Config fully deleted from MongoDB for ${cleanNumber}`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting session from MongoDB:', error);
        return false;
    }
}

// FIX #3: Cache use karo — bar bar MongoDB na jao har message par
async function getUserConfigFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');

        const cached = getCachedConfig(cleanNumber);
        if (cached) return cached;

        const userDoc = await UserConfig.findOne({ number: cleanNumber });

        if (userDoc) {
            setCachedConfig(cleanNumber, userDoc.config);
            return userDoc.config;
        } else {
            const defaultConfig = {
                AUTO_RECORDING: 'false',
                AUTO_TYPING: 'false',
                ANTI_CALL: 'false',
                REJECT_MSG: '*🔕 ʏᴏᴜʀ ᴄᴀʟʟ ᴡᴀs ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ʀᴇᴊᴇᴄᴛᴇᴅ..!*',
                READ_MESSAGE: 'false',
                AUTO_VIEW_STATUS: 'true',
                AUTO_LIKE_STATUS: 'true',
                AUTO_STATUS_REPLY: 'false',
                AUTO_STATUS_MSG: 'Hello from ZAIDI-MD!',
                AUTO_LIKE_EMOJI: ['❤️', '👍', '😮', '😎'],
                ANTILINK_GROUPS: {},
                AUTO_REACT: 'false',
                AUTO_REACT_GROUP: 'true',
                AUTO_REACT_INBOX: 'true',
                AUTO_REACT_CMD_ONLY: 'false',
                AUTO_REACT_EMOJIS: ['❤️', '😍', '🔥', '👑', '💫', '✨', '😎', '🤩', '💕', '🌹']
            };
            await UserConfig.create({ number: cleanNumber, config: defaultConfig });
            setCachedConfig(cleanNumber, defaultConfig);
            return defaultConfig;
        }
    } catch (error) {
        console.error('❌ Error getting user config from MongoDB:', error);
        return {};
    }
}

// FIX: Update ke baad cache bhi update karo
async function updateUserConfigInMongoDB(number, newConfig) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await UserConfig.findOneAndUpdate(
            { number: cleanNumber },
            { config: newConfig, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        setCachedConfig(cleanNumber, newConfig);
        return true;
    } catch (error) {
        console.error('❌ Error updating user config in MongoDB:', error);
        return false;
    }
}

async function saveOTPToMongoDB(number, otp, config) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await OTP.create({ number: cleanNumber, otp: otp, config: config });
        return true;
    } catch (error) {
        console.error('❌ Error saving OTP to MongoDB:', error);
        return false;
    }
}

async function verifyOTPFromMongoDB(number, otp) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const otpRecord = await OTP.findOne({
            number: cleanNumber,
            otp: otp,
            expiresAt: { $gt: new Date() }
        });
        if (!otpRecord) return { valid: false, error: 'Invalid or expired OTP' };
        await OTP.deleteOne({ _id: otpRecord._id });
        return { valid: true, config: otpRecord.config };
    } catch (error) {
        console.error('❌ Error verifying OTP from MongoDB:', error);
        return { valid: false, error: 'Verification error' };
    }
}

async function addNumberToMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await ActiveNumber.findOneAndUpdate(
            { number: cleanNumber },
            { lastConnected: new Date(), isActive: true },
            { upsert: true, new: true }
        );
        return true;
    } catch (error) {
        console.error('❌ Error adding number to MongoDB:', error);
        return false;
    }
}

async function removeNumberFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await ActiveNumber.deleteOne({ number: cleanNumber });
        return true;
    } catch (error) {
        console.error('❌ Error removing number from MongoDB:', error);
        return false;
    }
}

async function getAllNumbersFromMongoDB() {
    try {
        const activeNumbers = await ActiveNumber.find({ isActive: true });
        return activeNumbers.map(num => num.number);
    } catch (error) {
        console.error('❌ Error getting numbers from MongoDB:', error);
        return [];
    }
}

async function incrementStats(number, field) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const today = new Date().toISOString().split('T')[0];
        await Stats.findOneAndUpdate(
            { number: cleanNumber, date: today },
            { $inc: { [field]: 1 } },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('❌ Error updating stats:', error);
    }
}

async function getStatsForNumber(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const stats = await Stats.find({ number: cleanNumber }).sort({ date: -1 }).limit(30);
        return stats;
    } catch (error) {
        console.error('❌ Error getting stats:', error);
        return [];
    }
}

async function getDB() {
    return mongoose.connection.db;
}

// =================================
// EXPORTS
// =================================

module.exports = {
    connectdb,
    getDB,

    Session,
    UserConfig,
    OTP,
    ActiveNumber,
    Stats,

    saveSessionToMongoDB,
    getSessionFromMongoDB,
    deleteSessionFromMongoDB,

    getUserConfigFromMongoDB,
    updateUserConfigInMongoDB,

    saveOTPToMongoDB,
    verifyOTPFromMongoDB,

    addNumberToMongoDB,
    removeNumberFromMongoDB,
    getAllNumbersFromMongoDB,

    incrementStats,
    getStatsForNumber,

    clearCachedConfig,

    getUserConfig: async (number) => {
        const cfg = await getUserConfigFromMongoDB(number);
        return cfg || {};
    },
    updateUserConfig: updateUserConfigInMongoDB
};
