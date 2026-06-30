const { cmd } = require('../zaidi');

cmd({
    pattern: "alive",
    desc: "⚡ Check if bot is active (Funny style)",
    category: "main",
    react: "😂",
    filename: __filename
}, async (conn, mek, m, { from }) => {

    try {
        // Desi/Funny replies ka array
        const funnyReplies = [
            "*𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 Zinda hai beta! Zinda hai! Chain se sone bhi nahi dete... 🥱*",
            "*𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 Active hi hoon boss! Koi kaam dhanda hai ya bas check hi karte rahoge? 🙄*",
            "*Hazir janaab! 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 bilkul active hai. Hukum karein, par udhaar mat maangna! 💸*",
            "*Idhar hi hoon yaar, charging pe laga hua tha. Bolo kya hukam hai? 🔌🔋*",
            "*𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 is Active! Sakoon mil gaya? Ab chalo jaldi se kaam batao apna! 😜*"
        ];

        // Randomly aik funny reply select karne ke liye
        const randomReply = funnyReplies[Math.floor(Math.random() * funnyReplies.length)];

        // Direct single text reply
        await conn.sendMessage(from, { 
            text: randomReply 
        }, { quoted: m });

    } catch (e) {
        console.error("Alive Error:", e);
    }
});
