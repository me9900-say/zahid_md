const { cmd } = require('../zaidi');
const axios = require('axios');
const yts = require('yt-search');

// ============ MULTI-API SYSTEM ============
const APIS = [
    {
        name: "Faizan",
        url: (ytLink) => `https://faizan-api.vercel.app/api/ytdown?url=${encodeURIComponent(ytLink)}&format=mp3`,
        getAudioUrl: (data) => data?.downloadURL || null,
        getTitle: (data) => null,
        getThumbnail: (data) => null
    },
    {
        name: "Arslan",
        url: (ytLink) => `https://arslan-apis-v2.vercel.app/download/ytmp3?url=${encodeURIComponent(ytLink)}`,
        getAudioUrl: (data) => data?.result?.download?.url || null,
        getTitle: (data) => data?.result?.metadata?.title || null,
        getThumbnail: (data) => data?.result?.metadata?.thumbnail || null,
        getDuration: (data) => data?.result?.metadata?.duration || null,
        getAuthor: (data) => data?.result?.metadata?.author || null,
        getViews: (data) => data?.result?.metadata?.views || null
    },
    {
        name: "EliteProTech",
        url: (ytLink) => `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(ytLink)}&format=mp3`,
        getAudioUrl: (data) => data?.downloadURL || null,
        getTitle: (data) => data?.title || null,
        getThumbnail: (data) => data?.thumbnail || null,
        getDuration: (data) => data?.duration || null,
        getAuthor: (data) => data?.author || null,
        getViews: (data) => data?.views || null
    },
    {
        name: "Yupra",
        url: (ytLink) => `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(ytLink)}`,
        getAudioUrl: (data) => data?.data?.download_url || null,
        getTitle: (data) => data?.data?.title || null,
        getThumbnail: (data) => data?.data?.thumbnail || null,
        getDuration: (data) => data?.data?.duration || null,
        getAuthor: (data) => data?.data?.author || null,
        getViews: (data) => data?.data?.views || null
    }
];

// ============ MAIN DOWNLOAD FUNCTION ============
async function getAudioFromApi(youtubeUrl) {
    for (const api of APIS) {
        try {
            console.log(`📡 Trying ${api.name} API...`);
            const response = await axios.get(api.url(youtubeUrl), { 
                timeout: 35000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            
            const audioUrl = api.getAudioUrl(response.data);
            if (audioUrl) {
                console.log(`✅ ${api.name} API Success!`);
                return {
                    success: true,
                    audioUrl: audioUrl,
                    title: api.getTitle(response.data) || 'Unknown Song',
                    thumbnail: api.getThumbnail(response.data) || null,
                    duration: api.getDuration(response.data) || 'N/A',
                    author: api.getAuthor(response.data) || 'Unknown Artist',
                    views: api.getViews(response.data) || '0',
                    apiUsed: api.name
                };
            }
        } catch (error) {
            console.log(`❌ ${api.name} Failed:`, error.message);
        }
    }
    return { success: false, error: "All APIs failed" };
}

// ============ FORMAT DURATION ============
function formatDuration(seconds) {
    if (!seconds || seconds === 'N/A') return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============ FORMAT VIEWS ============
function formatViews(views) {
    if (!views || views === '0') return 'N/A';
    const num = parseInt(views);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ============ MAIN PLAY COMMAND ============
cmd({
    pattern: "play",
    alias: ["song", "music", "audio", "ytmp3"],
    desc: "Download YouTube audio with beautiful design",
    category: "downloader",
    react: "🎶",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        const query = q ? q.trim() : '';

        if (!query) {
            return reply(`╭─❖ *🎵 PLAY ENGINE* ❖─⬣
│
│  ✧ *Usage:* .play <song name/link>
│  ✧ *Example:* .play Pal Pal Dil Ke Paas
│  ✧ *Aliases:* song, music, audio
│
╰───────────────⬣
> 🔥 ZAIDI-MD`);
        }

        // React with searching
        await conn.sendMessage(from, { react: { text: '🔍', key: m.key } });

        let videoUrl = query;
        let videoTitle = 'Unknown Song';
        let thumbnail = null;
        let duration = 'N/A';
        let author = 'Unknown Artist';
        let views = '0';

        // Check if YouTube link
        const isYoutubeLink = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)?)([a-zA-Z0-9_-]{11})/i.test(query);

        if (!isYoutubeLink) {
            // Search on YouTube
            const search = await yts(query);
            if (!search?.videos?.length) {
                await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                return reply(`╭─❖ *🔎 NO RESULTS* ❖─⬣
│
│  ✧ No matches found for:
│  ✧ *"${query}"*
│
│  💡 Try:
│  • Different keywords
│  • Artist name + song
│
╰───────────────⬣`);
            }

            const video = search.videos[0];
            videoUrl = video.url;
            videoTitle = video.title || 'Unknown Song';
            thumbnail = video.thumbnail || null;
            duration = video.duration || 'N/A';
            author = video.author?.name || 'Unknown Artist';
            views = video.views?.toString() || '0';
        }

        // Get audio from APIs
        const result = await getAudioFromApi(videoUrl);
        if (!result.success || !result.audioUrl) {
            await conn.sendMessage(from, { react: { text: '⚠️', key: m.key } });
            return reply(`╭─❖ *⚠️ DOWNLOAD FAILED* ❖─⬣
│
│  ✧ Could not fetch audio
│  ✧ Try again or use different song
│
╰───────────────⬣`);
        }

        // Format duration & views
        const formattedDuration = duration !== 'N/A' ? formatDuration(duration) : 'N/A';
        const formattedViews = views !== '0' ? formatViews(views) : 'N/A';
        const finalThumbnail = thumbnail || result.thumbnail || null;

        // ============ SEND BEAUTIFUL DESIGN MESSAGE ============
        const designMsg = `╭─❖ *🎵 SONG FOUND* ❖─⬣
│
│  ✧ *Title:* ${result.title || videoTitle}
│  ✧ *Artist:* ${result.author || author}
│  ✧ *Duration:* ${formattedDuration}
│  ✧ *Views:* ${formattedViews}
│  ✧ *API:* ${result.apiUsed}
│
╰───────────────⬣
> 🚀 Downloading Audio...`;

        await reply(designMsg);

        // Send thumbnail if available
        if (finalThumbnail) {
            try {
                await conn.sendMessage(from, {
                    image: { url: finalThumbnail },
                    caption: `🎵 *${result.title || videoTitle}*\n👤 *${result.author || author}*\n⏱ *${formattedDuration}*`
                }, { quoted: mek });
            } catch (e) {
                console.log('Thumbnail send failed:', e);
            }
        }

        // React downloading
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: result.audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${result.title || videoTitle}.mp3`
        }, { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        // Success message
        await reply(`╭─❖ *✅ DOWNLOADED* ❖─⬣
│
│  ✧ *Song:* ${result.title || videoTitle}
│  ✧ *Artist:* ${result.author || author}
│  ✧ *Duration:* ${formattedDuration}
│  ✧ *Powered By:* ${result.apiUsed}
│
╰───────────────⬣
> 🎶 Enjoy the music!`);

    } catch (error) {
        console.error('Play Command Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply(`╭─❖ *❌ ERROR* ❖─⬣
│
│  ✧ Something went wrong!
│  ✧ Error: ${error.message?.slice(0, 50) || 'Unknown'}
│
╰───────────────⬣
> 🔧 Try again later`);
    }
});
