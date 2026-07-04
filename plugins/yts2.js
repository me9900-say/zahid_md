const { cmd } = require('../zaidi'); // Custom bot handler matching your instance path
const axios = require('axios');
const yts = require('yt-search');

// ============ MULTI-API SYSTEM FOR AUDIO & VIDEO ============
const AUDIO_APIS = [
    {
        name: "Izumi API",
        url: (ytLink) => `https://api.ootaizumi.web.id/downloader/youtube?url=${encodeURIComponent(ytLink)}&format=mp3`,
        getAudioUrl: (data) => {
            if (data?.status && data?.result?.download) {
                return data.result.download;
            }
            return null;
        },
        getTitle: (data) => data?.result?.title
    }
];

const VIDEO_APIS = [
    {
        name: "JawadTech API",
        url: (ytLink) => `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(ytLink)}`,
        getVideoUrl: (data) => {
            if (data?.status && data?.result?.mp4) {
                return data.result.mp4;
            }
            return null;
        },
        getTitle: (data) => data?.result?.title
    }
];

// ============ REUSABLE BACKEND LOOP HANDLERS ============
async function getAudioFromApi(youtubeUrl) {
    for (const api of AUDIO_APIS) {
        try {
            console.log(`📡 Fetching Audio via ${api.name}...`);
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

async function getVideoFromApi(youtubeUrl) {
    for (const api of VIDEO_APIS) {
        try {
            console.log(`📡 Fetching Video via ${api.name}...`);
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
    return { success: false, error: "All backend stream sources failed" };
}

// ============ MAIN PLAY2 / AUDIO PLUGIN COMMAND ============
cmd({
    pattern: "play2",
    alias: ["song2", "audio2"],
    desc: "🎵 Download YouTube audio via Izumi Engine Layout",
    category: "download",
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {

    try {
        const query = text ? text.trim() : '';

        if (!query) {
            return await reply(`╭━〔 🎵 MUSIC ENGINE 2 〕━⬣
┃ ⚠️ Example: .play2 Alone Marshmello
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

        // Structured Output Layout
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

// ============ MAIN VIDEO2 / YTMP4 PLUGIN COMMAND ============
cmd({
    pattern: "video2",
    alias: ["ytv2", "mp4v2"],
    desc: "📹 Download YouTube video via JawadTech Engine Layout",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {

    try {
        const query = text ? text.trim() : '';

        if (!query) {
            return await reply(`╭━〔 📹 VIDEO ENGINE 2 〕━⬣
┃ ⚠️ Example: .video2 Alone Marshmello
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
        
        const videoUrlDownload = apiResult.videoUrl;
        const safeTitle = (apiResult.title || title).replace(/[<>:"/\\|?*]/g, '_').trim();

        // Structured Output Layout
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
            video: { url: videoUrlDownload },
            caption: `🎬 *${safeTitle}*\n\n*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪*`,
            mimetype: 'video/mp4'
        }, { quoted: sentInfo });

        // Success Reaction Completion
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Advanced Video Download Error:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
