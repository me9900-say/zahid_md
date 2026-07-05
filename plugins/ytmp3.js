const axios = require("axios");
const yts = require("yt-search");
const { cmd } = require("../zaidi");

cmd({
    pattern: "play",
    alias: ["song", "ytmp3", "music", "audio", "gana"],
    react: "🎵",
    desc: "YouTube search & MP3 download with beautiful design",
    category: "downloader",
    use: ".play <song name>",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    try {
        const query = args.join(" ");
        
        if (!query) {
            return reply(`╭─❖ *🎵 PLAY ENGINE* ❖─⬣
│
│  ✧ *Usage:* .play <song name>
│  ✧ *Example:* .play headlights
│  ✧ *Aliases:* song, music, ytmp3
│
╰───────────────⬣
> 🔥 ZAIDI-MD`);
        }

        // ============ STEP 1: SEARCH YOUTUBE ============
        console.log('[PLAY] 🔍 Searching for:', query);
        await conn.sendMessage(from, { 
            react: { text: "🔍", key: m.key } 
        });

        const search = await yts(query);
        
        // Validate search results
        if (!search || !search.videos || !search.videos.length) {
            console.log('[PLAY] ❌ No search results found');
            await conn.sendMessage(from, { 
                react: { text: "❌", key: m.key } 
            });
            return reply(`╭─❖ *🔎 NO RESULTS* ❖─⬣
│
│  ✧ No matches found for:
│  ✧ *"${query}"*
│
│  💡 Try different keywords
│
╰───────────────⬣`);
        }

        // ============ STEP 2: SELECT FIRST VIDEO ============
        const video = search.videos[0];
        console.log('[PLAY] ✅ Selected video:', video.title);
        console.log('[PLAY] 📹 Video URL:', video.url);

        // ============ STEP 3: CALL DOWNLOAD API ============
        console.log('[PLAY] 🌐 Calling download API...');
        
        let downloadUrl = "";
        let songTitle = video.title || "Unknown Song";
        let thumbnail = video.thumbnail || "";
        let duration = video.timestamp || "N/A";
        let author = video.author?.name || "Unknown Artist";
        let views = video.views ? formatViews(video.views) : "N/A";

        try {
            const apiResponse = await axios.get(
                `https://faizan-api.vercel.app/api/ytdown?url=${encodeURIComponent(video.url)}&format=mp3`,
                { 
                    timeout: 30000,
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            console.log('[PLAY] 📦 API Response received');

            // ============ STEP 4: VALIDATE API RESPONSE ============
            if (!apiResponse || !apiResponse.data) {
                throw new Error('API returned empty response');
            }

            // Check required fields
            const requiredFields = ['downloadURL', 'title', 'thumbnail'];
            const missingFields = requiredFields.filter(field => !apiResponse.data[field]);
            
            if (missingFields.length > 0) {
                console.log('[PLAY] ❌ Missing fields:', missingFields);
                throw new Error(`API response missing: ${missingFields.join(', ')}`);
            }

            downloadUrl = apiResponse.data.downloadURL;
            songTitle = apiResponse.data.title || video.title;
            thumbnail = apiResponse.data.thumbnail || video.thumbnail;

            console.log('[PLAY] ✅ API Response validated');
            console.log('[PLAY] 🎵 Title:', songTitle);
            console.log('[PLAY] 🔗 Download URL:', downloadUrl.substring(0, 100) + '...');

        } catch (apiErr) {
            console.error('[PLAY] ❌ API Error:', apiErr.message);
            await conn.sendMessage(from, { 
                react: { text: "⚠️", key: m.key } 
            });
            return reply(`╭─❖ *⚠️ API ERROR* ❖─⬣
│
│  ✧ Failed to fetch audio data
│  ✧ Error: ${apiErr.message}
│  ✧ Try again later
│
╰───────────────⬣`);
        }

        // ============ STEP 5: VALIDATE DOWNLOAD URL ============
        if (!downloadUrl || !downloadUrl.startsWith('http')) {
            console.log('[PLAY] ❌ Invalid download URL:', downloadUrl);
            await conn.sendMessage(from, { 
                react: { text: "⚠️", key: m.key } 
            });
            return reply(`╭─❖ *⚠️ INVALID URL* ❖─⬣
│
│  ✧ Download URL is invalid
│  ✧ Please try again
│
╰───────────────⬣`);
        }

        // ============ SEND THUMBNAIL AND DETAILS ============
        const caption = `╭─❖ *🎵 SONG FOUND* ❖─⬣
│
│  ✧ *Title:* ${songTitle}
│  ✧ *Artist:* ${author}
│  ✧ *Duration:* ${duration}
│  ✧ *Views:* ${views}
│  ✧ *Requested By:* @${sender.split("@")[0]}
│
╰───────────────⬣
> 🎶 Downloading audio...`;

        const thumbnailMsg = await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: caption,
            mentions: [sender]
        });

        await conn.sendMessage(from, { 
            react: { text: "⏳", key: m.key } 
        });

        // ============ STEP 6: DOWNLOAD AUDIO ============
        console.log('[PLAY] ⬇️ Downloading audio...');
        
        let audioResponse;
        try {
            audioResponse = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                maxContentLength: 50 * 1024 * 1024, // 50MB limit
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
        } catch (downloadErr) {
            console.error('[PLAY] ❌ Download failed:', downloadErr.message);
            await conn.sendMessage(from, { 
                react: { text: "❌", key: m.key } 
            });
            return reply(`╭─❖ *❌ DOWNLOAD FAILED* ❖─⬣
│
│  ✧ Failed to download audio
│  ✧ Error: ${downloadErr.message}
│  ✧ Please try again
│
╰───────────────⬣`);
        }

        // ============ STEP 7: VERIFY DOWNLOADED FILE ============
        const audioBuffer = Buffer.from(audioResponse.data);
        const fileSize = audioBuffer.length;
        
        console.log('[PLAY] 📊 File size:', fileSize, 'bytes');
        console.log('[PLAY] 📋 Content-Type:', audioResponse.headers['content-type']);

        // Check if download completed successfully
        if (!audioBuffer || audioBuffer.length === 0) {
            console.log('[PLAY] ❌ Empty audio buffer');
            await conn.sendMessage(from, { 
                react: { text: "❌", key: m.key } 
            });
            return reply(`╭─❖ *❌ EMPTY FILE* ❖─⬣
│
│  ✧ Downloaded file is empty
│  ✧ Please try again
│
╰───────────────⬣`);
        }

        // Check file size (minimum 50KB for valid MP3)
        if (fileSize < 50 * 1024) {
            console.log('[PLAY] ❌ File too small:', fileSize, 'bytes');
            await conn.sendMessage(from, { 
                react: { text: "❌", key: m.key } 
            });
            return reply(`╭─❖ *❌ INVALID FILE* ❖─⬣
│
│  ✧ Downloaded file is too small
│  ✧ Size: ${(fileSize / 1024).toFixed(1)} KB
│  ✧ This might not be a valid audio file
│
╰───────────────⬣`);
        }

        // Check if file is too large (WhatsApp limit ~16MB)
        if (fileSize > 16 * 1024 * 1024) {
            console.log('[PLAY] ❌ File too large:', fileSize, 'bytes');
            await conn.sendMessage(from, { 
                react: { text: "❌", key: m.key } 
            });
            return reply(`╭─❖ *❌ FILE TOO LARGE* ❖─⬣
│
│  ✧ Audio file exceeds WhatsApp limit
│  ✧ Size: ${(fileSize / (1024 * 1024)).toFixed(1)} MB
│  ✧ Max: 16 MB
│
╰───────────────⬣`);
        }

        // ============ STEP 8: VERIFY CONTENT-TYPE ============
        const contentType = audioResponse.headers['content-type'] || '';
        console.log('[PLAY] 📋 Content-Type:', contentType);

        // Check if it's actually an audio file
        if (contentType.includes('text/html') || contentType.includes('application/json')) {
            console.log('[PLAY] ❌ Invalid content-type:', contentType);
            await conn.sendMessage(from, { 
                react: { text: "❌", key: m.key } 
            });
            return reply(`╭─❖ *❌ INVALID RESPONSE* ❖─⬣
│
│  ✧ Server returned ${contentType}
│  ✧ Expected audio/mpeg
│  ✧ Please try again
│
╰───────────────⬣`);
        }

        // ============ STEP 9: SEND AUDIO ============
        console.log('[PLAY] 🎵 Sending audio to WhatsApp...');
        
        const fileName = `${songTitle.replace(/[^\w\s\-]/g, '').substring(0, 50)}.mp3`;

        try {
            await conn.sendMessage(from, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: fileName,
                ptt: false
            }, { quoted: thumbnailMsg });

            console.log('[PLAY] ✅ Audio sent successfully');
            console.log('[PLAY] 📁 File name:', fileName);
            console.log('[PLAY] 📊 File size:', (fileSize / 1024).toFixed(1), 'KB');

            // ============ STEP 10: REACT WITH SUCCESS ============
            await conn.sendMessage(from, { 
                react: { text: "✅", key: m.key } 
            });

        } catch (sendErr) {
            console.error('[PLAY] ❌ Failed to send audio:', sendErr.message);
            await conn.sendMessage(from, { 
                react: { text: "❌", key: m.key } 
            });
            return reply(`╭─❖ *❌ SEND FAILED* ❖─⬣
│
│  ✧ Failed to send audio
│  ✧ Error: ${sendErr.message}
│  ✧ Try again or use different song
│
╰───────────────⬣`);
        }

    } catch (err) {
        console.error('[PLAY] ❌ UNEXPECTED ERROR:', err);
        await conn.sendMessage(from, { 
            react: { text: "❌", key: m.key } 
        });
        return reply(`╭─❖ *❌ ERROR* ❖─⬣
│
│  ✧ ${err.message?.slice(0, 50) || 'Something went wrong!'}
│  ✧ Please try again later
│
╰───────────────⬣`);
    }
});

function formatViews(views) {
    if (!views) return "N/A";
    const num = parseInt(views);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
}
