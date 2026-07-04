const { cmd } = require('../zaidi');   // ✅ Sahi import
const axios = require('axios');        // Axios for API requests
const yts = require('yt-search');     // YouTube search library

// ===== Primary Downloader (Aapki API) =====
async function jawadTechAPI(url) {
    try {
        let res = await axios.get(`https://jawad-tech.vercel.app/download/ytdl?url=${url}`);
        // API response ke dono mumkin tareeqay check kar rahe hain
        return res.data?.result?.audio || res.data?.data?.audio || res.data?.result?.downloadUrl || null;
    } catch {
        return null;
    }
}

// ===== Backup Downloader (Agar primary fail ho jaye) =====
async function backupAPI(url) {
    try {
        // Ek reliable public api fallback ke liye
        let res = await axios.get(`https://api.dreaded.site/download/ytdl?url=${url}`);
        return res.data?.result?.audio || res.data?.result?.downloadUrl || null;
    } catch {
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
    await reply(`⏳ Downloading: *${videoTitle}*... Please wait.`);

    try {
        // Pehle aapki API try karega
        let audioUrl = await jawadTechAPI(url);

        // Agar aapki API fail hui, toh backup API try karega
        if (!audioUrl) {
            console.log("Primary API failed, trying backup...");
            audioUrl = await backupAPI(url);
        }

        // Agar dono fail ho jayein
        if (!audioUrl) {
            return reply("❌ Download failed. Dono APIs down hain ya link me koi masala hai.");
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
