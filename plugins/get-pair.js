// === commands/pair.js ===
const { cmd } = require('../zaidi');
const axios = require('axios');

const API_BASE_URL = 'https://techxpair.vercel.app/api';

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get pairing code for The ZAIDI MD bot",
    category: "owner",
    use: ".pair 923XxxxXXX",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Please provide a valid phone number without +\nExample: .pair 923XxXxXXX");
        }

        const randomResponse = await axios.get(`${API_BASE_URL}/random`, { timeout: 5000 });
        
        if (!randomResponse.data || !randomResponse.data.server) {
            return await reply("❌ Failed to get available server. Please try again.");
        }

        const selectedServer = randomResponse.data.server;
        
        const response = await axios.get(`${API_BASE_URL}/code`, {
            params: { 
                server: selectedServer, 
                number: phoneNumber 
            },
            timeout: 20000
        });

        if (!response.data || !response.data.code) {
            return await reply("❌ Failed to retrieve pairing code. Please try again later.");
        }

        // 🔥 SIRF CODE — KOI EXTRA TEXT NAHI 🔥
        await reply(response.data.code);

    } catch (error) {
        console.error("Pair command error:", error);
        await reply("❌ An error occurred while getting pairing code. Please try again later.");
    }
});