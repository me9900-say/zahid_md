const { cmd } = require('../zaidi');   // ✅ Sahi import
const axios = require('axios');        // Axios for API requests
const yts = require('yt-search');     // YouTube search library

// ===== YouTube Downloader API =====
async function downloadYTAudio(url) {
    try {
        let res = await axios.get(`https://jawad-tech.vercel.app/download/ytdl?url=${url}`);
        return res.data.result?.audio || res.data.data?.audio || null;
    } catch (error) {
        console.error("API Fetch Error:", error);
        return null;
    }
}

cmd({
    pattern: "play",                  // Primary command
    alias: ["ytmp3", "yta", "song"],  // Aliases
    desc: "Download YouTube Audio by Link or Search Name",
    category: "downloader",
    react: "🎶",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, quoted }) => {

    // 1️⃣ Check if input is provided (using 'q' to get full text)
    if (!q) {
        return reply("❌ Link ya song ka naam do!\n\nExample 1: .play https://youtu.be/xxxxxx\nExample 2: .play pal pal");
    }

    let url = q.trim();

    // 2️⃣ Check if input is NOT a link (Yani agar user ne naam search kiya ha)
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        
        await reply(`⏳ Searching for *"${q}"* on YouTube...`);
        
        try {
            // YouTube pe search karo
            let searchResult = await yts(q);
            let video = searchResult.videos[0]; // Pehli video uthao

            if (!video) {
                return reply("❌ Koi video nahi mili. Kuch aur search karo!");
            }

            url = video.url; // Naam ki jagah ab hume video ka link mil gaya
            
        } catch (searchError) {
            console.error("YT Search Error:", searchError);
            return reply("⚠️ Search karne me masala aya, direct link try karein.");
        }
    }

    // 3️⃣ Status message for downloading
    await reply("⏳ *ZAIDI-MD* is downloading audio... Please wait.");

    try {
        // Download using your API
        let audioUrl = await downloadYTAudio(url);

        if (!audioUrl) {
            return reply("❌ Download failed. Maybe the link is invalid or the API is currently down.");
        }

        // 4️⃣ Send Audio File
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            filename: 'zaidi-audio.mp3'
        }, { quoted: mek });

    } catch (error) {
        console.error("Play Command Error:", error);
        return reply("⚠️ Kuch gadbad ho gayi! Try again later.");
    }
});
