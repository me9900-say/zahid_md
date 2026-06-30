const { cmd } = require('../zaidi'); // Custom bot handler matching your instance path
const axios = require('axios');
const yts = require('yt-search');

// ============ MULTI-API SYSTEM WITH FAIZAN MP4 API AS PRIMARY ============
const APIS = [
    {
        name: "Faizan MP4 API",
        url: (ytLink) => `https://faizan-api.vercel.app/api/ytmp4?url=${encodeURIComponent(ytLink)}`,
        getVideoUrl: (data) => {
            if (data?.status && data?.result?.url) {
                return data.result.url;
            }
            return null;
        },
        getTitle: (data) => data?.result?.title
    }
];

// ============ REUSABLE ADVANCED API LOOP HANDLING ============
async function getVideoFromApi(youtubeUrl) {
    for (const api of APIS) {
        try {
            console.log(`📡 Fetching via ${api.name}...`);
            const response = await axios.get(api.url(youtubeUrl), { timeout: 30000 });
            const videoUrl = api.getVideoUrl(response.data);
            
            if (videoUrl) {
                console.log(`✅ ${api.name} Success!`);
                return {
                    success: true,
                    videoUrl: videoUrl,
                    title: api.getTitle(response.data) || null,
                    apiUsed: api.name
                };
            }
        } catch (error) {
            console.log(`❌ ${api.name} Failed:`, error.message);
        }
    }
    return { success: false, error: "All backend video stream sources failed" };
}

// ============ MAIN PLAY / YTMP4 PLUGIN COMMAND ============
cmd({
    pattern: "ytmp4",
    alias: ["video", "ytv", "vdocmd"],
    desc: "📥 Instant Download YouTube video via multi-engine layout",
    category: "download",
    react: "🎥",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {

    try {
        const query = text ? text.trim() : '';

        if (!query) {
            return await reply(`╭━〔 🎥 VIDEO ENGINE 〕━⬣
┃ ⚠️ Example: .ytmp4 pal pal 
╰━━━━━━━━━━━━━━━━━━⬣
> 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`);
        }

        // Processing Reaction
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Regex configuration for matching standard URLs
        const isYoutubeLink = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)?)([a-zA-Z0-9_-]{11})/i.test(query);

        let videoUrl = query;
        let title = 'Unknown YouTube Video';
        let thumbnail = 'https://up6.cc/2026/05/177971006919991.png';
        let duration = 'Unknown';
        let author = 'YouTube Video';
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
        const apiResult = await getVideoFromApi(videoUrl);
        
        if (!apiResult.success || !apiResult.videoUrl) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ *Video processing server is currently down!*");
        }
        
        const finalVideoUrl = apiResult.videoUrl;
        const safeTitle = (apiResult.title || title).replace(/[<>:"/\\|?*]/g, '_').trim();

        // Exact structured format according to your layout requirement
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

        // Step 2: Send Video File quoting the details card above
        await conn.sendMessage(from, {
            video: { url: finalVideoUrl },
            mimetype: 'video/mp4',
            caption: `*📌 Title:* ${safeTitle}\n\n> ⚡ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪⚡`
        }, { quoted: sentInfo });

        // Success Reaction Completion
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Advanced Video Play Error:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
