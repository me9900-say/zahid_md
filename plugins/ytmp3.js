const { cmd } = require('../zaidi');   // ✅ Sahi import
const axios = require('axios');        // Axios for API requests
const yts = require('yt-search');     // YouTube search library

// ===== Fast Faizan API Downloader =====
async function downloadYTAudio(url) {
    try {
        // Naya endpoint aur format=mp3 query parameter ke sath request
        let res = await axios.get(`https://faizan-api.vercel.app/api/ytdown?url=${encodeURIComponent(url)}&format=mp3`);
        
        // Naye JSON structure ke mutabiq direct downloadURL extract kar rahe hain
        return res.data?.downloadURL || null;
    } catch (error) {
        console.error("Faizan Fast API Fetch Error:", error);
        return null;
    }
}

cmd({
    pattern: "play",                  // Primary command
    alias: ["ytmp3", "yta", "song"],  // Aliases
    desc: "Download YouTube Audio Fast by Link or Search Name",
    category: "downloader",
    react: "🎶",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, quoted }) => {

    // 1️⃣ Check if input is provided
    if (!q) {
        return reply("❌ Link ya song ka naam do!\n\nExample: .play pal pal");
    }

    let url = q.trim();
    let videoTitle = "ZAIDI-MD Audio";

    // 2️⃣ Check if input is Text (Search query)
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        
        await reply(`⏳ Searching for *"${q}"* on YouTube...`);
        
        try {
            let searchResult = await yts(q);
            let video = searchResult.videos[0]; // Pehli video uthao

            if (!video) {
                return reply("❌ Koi video nahi mili. Kuch aur search karo!");
            }

            url = video.url; // Video link mil gaya
            videoTitle = video.title; // Title track karne ke liye
            
        } catch (searchError) {
            console.error("YT Search Error:", searchError);
            return reply("⚠️ Search karne me masala aya, direct link try karein.");
        }
    }

    // 3️⃣ Status message for downloading
    await reply(`⏳ Downloading Fast: *${videoTitle}*... Please wait.`);

    try {
        // Nayi Fast API se download link uthao
        let audioUrl = await downloadYTAudio(url);

        if (!audioUrl) {
            return reply("❌ Download failed! Fast API ne response nahi diya.");
        }

        // 4️⃣ Send Audio File
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            filename: `${videoTitle}.mp3`
        }, { quoted: mek });

    } catch (error) {
        console.error("Play Command Error:", error);
        return reply("⚠️ Kuch gadbad ho gayi! Try again later.");
    }
});
