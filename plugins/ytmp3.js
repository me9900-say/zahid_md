const { cmd } = require('../zaidi'); // Custom bot handler matching your instance path
const axios = require('axios');
const yts = require('yt-search');

// ============ MULTI-API SYSTEM WITH FAIZAN API AS PRIMARY ============
const APIS = [
    {
        name: "Faizan API",
        url: (ytLink) => `https://faizan-api.vercel.app/api/ytmp3?url=${encodeURIComponent(ytLink)}`,
        getAudioUrl: (data) => {
            if (data?.status && data?.result?.download) {
                return data.result.download;
            }
            return null;
        },
        getTitle: (data) => data?.result?.title
    }
];

// ============ REUSABLE ADVANCED API LOOP HANDLING ============
async function getAudioFromApi(youtubeUrl) {
    for (const api of APIS) {
        try {
            console.log(`📡 Fetching via ${api.name}...`);
            const response = await axios.get(api.url(youtubeUrl), { timeout: 30000 });
            const audioUrl = api.getAudioUrl(response.data);
            
            if (audioUrl) {
                console.log(`✅ ${api.name} Success!`);
                return {
                    success: true,
                    audioUrl: audioUrl,
                    title: api.getTitle(response.data) || null,
                    apiUsed: api.name
                };
            }
        } catch (error) {
            console.log(`❌ ${api.name} Failed:`, error.message);
        }
    }
    return { success: false, error: "All backend stream sources failed" };
}

// ============ MAIN PLAY / YTMP3 PLUGIN COMMAND ============
cmd({
    pattern: "ytmp3",
    alias: ["play", "song", "audio", "naat"],
    desc: "🎵 Instant Download YouTube audio via multi-engine layout",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {

    try {
        const query = text ? text.trim() : '';

        if (!query) {
            return await reply(`╭━〔 🎵 MUSIC ENGINE 〕━⬣
┃ ⚠️ Example: .play pal pal 
╰━━━━━━━━━━━━━━━━━━⬣
> 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`);
        }

        // Processing Reaction
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Regex configuration for matching standard URLs
        const isYoutubeLink = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)?)([a-zA-Z0-9_-]{11})/i.test(query);

        let videoUrl = query;
        let title = 'Unknown YouTube Song';
        let thumbnail = 'https://up6.cc/2026/05/177971006919991.png';
        let duration = 'Unknown';
        let author = 'YouTube Audio';
        let views = '0';

        // Scraping data via internal yt-search context parser
        if (!isYoutubeLink) {
            const search = await yts(query);
            if (!search?.videos?.length) {
                await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                return await reply("❌ *No matching results found!*");
            }
            const video = search.videos[0];
            videoUrl = video.url;
            title = video.title || title;
            thumbnail = video.thumbnail || thumbnail;
            duration = video.timestamp || duration;
            author = video.author?.name || author;
            views = video.views ? video.views.toLocaleString() : views;
        } else {
            const videoId = query.match(/([a-zA-Z0-9_-]{11})/i)?.[1];
            const search = await yts({ videoId: videoId });
            if (search) {
                title = search.title || title;
                thumbnail = search.thumbnail || thumbnail;
                duration = search.timestamp || duration;
                videoUrl = search.url || query;
                author = search.author?.name || author;
                views = search.views ? search.views.toLocaleString() : views;
            }
        }

        // Dynamic Request Execution 
        const apiResult = await getAudioFromApi(videoUrl);
        
        if (!apiResult.success || !apiResult.audioUrl) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ *Audio processing server is currently down!*");
        }
        
        const audioUrl = apiResult.audioUrl;
        const safeTitle = (apiResult.title || title).replace(/[<>:"/\\|?*]/g, '_').trim();

        // New Structured Output Layout requested by User
        const infoMessage = `*${safeTitle}*\n\n` +
                            `👤 *Channel:* ${author}\n` +
                            `⏱ *Duration:* ${duration}\n` +
                            `👁 *Views:* ${views}\n\n` +
                            `> ⚡ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪⚡`;

        // Step 1: Send Details Card with Image
        const sentInfo = await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: infoMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363423196146172@newsletter",
                    newsletterName: "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪",
                    serverMessageId: 2,
                },
            },
        }, { quoted: m });

        // Step 2: Send Audio File quoting the details card above
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`
        }, { quoted: sentInfo });

        // Success Reaction Completion
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Advanced Music Play Error:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
