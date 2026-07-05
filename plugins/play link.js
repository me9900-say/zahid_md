// playlink.js
const axios = require("axios");
const { cmd } = require("../zaidi");

cmd({
    pattern: "playlink",
    alias: ["ytlink", "linkplay", "ytaudio", "ytsong"],
    react: "🔗",
    desc: "YouTube link se audio/video download karein",
    category: "downloader",
    use: ".playlink <YouTube URL>",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    try {
        const url = args[0];

        // ============ CHECK URL ============
        if (!url) {
            return reply(`╭─❖ *🔗 PLAYLINK ENGINE* ❖─⬣
│
│  ✧ *Usage:* .playlink <YouTube URL>
│  ✧ *Example:* .playlink https://youtube.com/watch?v=9n08xkSoUXM
│  ✧ *Aliases:* ytlink, linkplay, ytaudio
│
╰───────────────⬣
> 🔥 ZAIDI-MD`);
        }

        // ============ VALIDATE YOUTUBE URL ============
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(youtubeRegex);
        
        if (!match) {
            return reply(`╭─❖ *❌ INVALID URL* ❖─⬣
│
│  ✧ Please provide a valid YouTube URL
│  ✧ Supported formats:
│  • youtube.com/watch?v=xxxxx
│  • youtu.be/xxxxx
│  • youtube.com/shorts/xxxxx
│
╰───────────────⬣`);
        }

        const videoId = match[1];

        // ============ SEARCHING REACTION ============
        await conn.sendMessage(from, { 
            react: { text: "🔍", key: m.key } 
        });

        // ============ FETCH FROM API ============
        const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=https://youtube.com/watch?v=${videoId}`;
        
        const response = await axios.get(apiUrl, { timeout: 30000 });
        const data = response.data;

        if (!data.status) {
            throw new Error("API response status false");
        }

        // ============ CHECK AVAILABLE QUALITIES ============
        const qualities = data.available_qualities || [];
        const audioUrl = data.audio || "";
        const videoUrls = data.videos || {};

        // ============ BUILD OPTIONS ============
        let qualityOptions = "";
        qualities.forEach(q => {
            if (q === "mp3") {
                qualityOptions += `│  🎵 *${q}* (Audio Only)\n`;
            } else {
                const height = q === "2026" ? "4K" : 
                              q === "1350" ? "2K" :
                              q === "1012" ? "1080p" :
                              q === "676" ? "720p" :
                              q === "450" ? "480p" :
                              q === "338" ? "360p" :
                              q === "224" ? "240p" :
                              q === "136" ? "144p" : `${q}p`;
                qualityOptions += `│  🎬 *${q}* (${height})\n`;
            }
        });

        // ============ SEND INFO WITH BUTTONS ============
        const infoCaption = `╭─❖ *🎬 YOUTUBE INFO* ❖─⬣
│
│  ✧ *Title:* ${data.title || "Unknown"}
│  ✧ *Creator:* ${data.creator || "Hector Manuel"}
│  ✧ *Available Formats:*
${qualityOptions}
│
│  📌 *Commands to download:*
│  • .audio - Download MP3
│  • .video <quality> - Download Video
│  • Example: .video 720
│
╰───────────────⬣
> 🔥 ZAIDI-MD`;

        // ============ SEND THUMBNAIL ============
        await conn.sendMessage(from, {
            image: { url: data.thumbnail || "https://i.ytimg.com/vi/"+videoId+"/maxresdefault.jpg" },
            caption: infoCaption,
            mentions: [sender]
        });

        // ============ STORE DATA FOR SUB-COMMANDS ============
        // Global store (temporary)
        global._playlinkData = {
            [from]: {
                videoId: videoId,
                data: data,
                timestamp: Date.now()
            }
        };

        // ============ SUCCESS REACTION ============
        await conn.sendMessage(from, { 
            react: { text: "✅", key: m.key } 
        });

    } catch (err) {
        console.error("[PLAYLINK] Error:", err);
        await conn.sendMessage(from, { 
            react: { text: "❌", key: m.key } 
        });
        return reply(`╭─❖ *❌ ERROR* ❖─⬣
│
│  ✧ Could not fetch video data
│  ✧ Error: ${err.message || "Unknown error"}
│
│  💡 Try:
│  • Check the URL
│  • Make sure video is public
│
╰───────────────⬣`);
    }
});

// ============ SUB-COMMAND: AUDIO ============
cmd({
    pattern: "audio",
    alias: ["mp3", "song", "music"],
    react: "🎵",
    desc: "Download YouTube audio (MP3)",
    category: "downloader",
    use: ".audio",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender }) => {
    try {
        // ============ CHECK DATA ============
        const data = global._playlinkData?.[from];
        if (!data || Date.now() - data.timestamp > 300000) { // 5 min expiry
            return reply(`╭─❖ *⏳ EXPIRED* ❖─⬣
│
│  ✧ Please run .playlink first
│  ✧ Data has expired after 5 minutes
│
╰───────────────⬣`);
        }

        const videoData = data.data;
        const audioUrl = videoData.audio;
        
        if (!audioUrl) {
            return reply(`╭─❖ *❌ NO AUDIO* ❖─⬣
│
│  ✧ Audio not available for this video
│
╰───────────────⬣`);
        }

        // ============ DOWNLOADING REACTION ============
        await conn.sendMessage(from, { 
            react: { text: "⏳", key: m.key } 
        });

        // ============ SEND AUDIO ============
        const fileName = `${videoData.title.replace(/[^\w\s\-]/g, '')}.mp3`;
        
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: fileName
        });

        // ============ SUCCESS REACTION ============
        await conn.sendMessage(from, { 
            react: { text: "✅", key: m.key } 
        });

    } catch (err) {
        console.error("[AUDIO] Error:", err);
        await conn.sendMessage(from, { 
            react: { text: "❌", key: m.key } 
        });
        return reply(`╭─❖ *❌ ERROR* ❖─⬣
│
│  ✧ Could not download audio
│
╰───────────────⬣`);
    }
});

// ============ SUB-COMMAND: VIDEO ============
cmd({
    pattern: "video",
    alias: ["ytvideo", "mp4"],
    react: "🎬",
    desc: "Download YouTube video in specific quality",
    category: "downloader",
    use: ".video <quality>",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    try {
        const quality = args[0] || "720";

        // ============ CHECK DATA ============
        const data = global._playlinkData?.[from];
        if (!data || Date.now() - data.timestamp > 300000) {
            return reply(`╭─❖ *⏳ EXPIRED* ❖─⬣
│
│  ✧ Please run .playlink first
│  ✧ Data has expired after 5 minutes
│
╰───────────────⬣`);
        }

        const videoData = data.data;
        const videos = videoData.videos || {};
        
        // ============ FIND MATCHING QUALITY ============
        let selectedQuality = null;
        let selectedUrl = null;

        // Try exact match
        if (videos[quality]) {
            selectedQuality = quality;
            selectedUrl = videos[quality];
        } else {
            // Try to find by resolution
            const qualityMap = {
                "144": "136", "240": "224", "360": "338", 
                "480": "450", "720": "676", "1080": "1012",
                "2k": "1350", "4k": "2026"
            };
            
            const mapped = qualityMap[quality.toLowerCase()];
            if (mapped && videos[mapped]) {
                selectedQuality = mapped;
                selectedUrl = videos[mapped];
            } else {
                // Try to find nearest quality
                const available = Object.keys(videos).map(Number).sort((a,b) => a-b);
                const target = parseInt(quality);
                if (!isNaN(target)) {
                    for (const q of available) {
                        if (q >= target) {
                            selectedQuality = q.toString();
                            selectedUrl = videos[q];
                            break;
                        }
                    }
                }
                // Fallback to highest
                if (!selectedUrl) {
                    const highest = available[available.length - 1];
                    if (highest) {
                        selectedQuality = highest.toString();
                        selectedUrl = videos[highest];
                    }
                }
            }
        }

        if (!selectedUrl) {
            return reply(`╭─❖ *❌ NO VIDEO* ❖─⬣
│
│  ✧ Quality "${quality}" not available
│  ✧ Available: ${Object.keys(videos).join(", ")}
│
╰───────────────⬣`);
        }

        // ============ DOWNLOADING REACTION ============
        await conn.sendMessage(from, { 
            react: { text: "⏳", key: m.key } 
        });

        // ============ SEND VIDEO ============
        const fileName = `${videoData.title.replace(/[^\w\s\-]/g, '')}_${selectedQuality}.mp4`;
        
        await conn.sendMessage(from, {
            video: { url: selectedUrl },
            caption: `╭─❖ *🎬 VIDEO DOWNLOADED* ❖─⬣
│
│  ✧ *Title:* ${videoData.title}
│  ✧ *Quality:* ${selectedQuality}p
│  ✧ *Downloaded By:* @${sender.split("@")[0]}
│
╰───────────────⬣
> 🔥 ZAIDI-MD`,
            mentions: [sender]
        });

        // ============ SUCCESS REACTION ============
        await conn.sendMessage(from, { 
            react: { text: "✅", key: m.key } 
        });

    } catch (err) {
        console.error("[VIDEO] Error:", err);
        await conn.sendMessage(from, { 
            react: { text: "❌", key: m.key } 
        });
        return reply(`╭─❖ *❌ ERROR* ❖─⬣
│
│  ✧ Could not download video
│
╰───────────────⬣`);
    }
});
