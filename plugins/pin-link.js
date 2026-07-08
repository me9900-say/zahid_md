const { cmd } = require("../zaidi");
const axios = require('axios');

cmd({
  pattern: "pinvideolink",
  alias: ["pinlink", "pinvdl", "pinterestvlink"],
  react: "📥",
  desc: "Download images or videos from Pinterest",
  category: "media",
  filename: __filename
}, async (client, mek, m, { from, reply, body, prefix }) => {

  // Extract URL from input text
  const text = body.replace(new RegExp(`^${prefix}(pinterest|pin|pindl|pinterestdl)\\s*`, 'i'), '').trim();
  
  if (!text) {
    return reply(`📌 *Pinterest Downloader*\n\nUsage: ${prefix}pinterest <Pinterest URL>\nExample: ${prefix}pinterest https://pin.it/727sKM3cf`);
  }

  // Regex match Pinterest pin URLs (including pin.it shortened links)
  let urlMatch = text.match(/https?:\/\/[^\s]*pinterest[^\s]*\/pin\/[^\s]+/i);
  if (!urlMatch) urlMatch = text.match(/https?:\/\/pin\.it\/[^\s]+/i);
  if (!urlMatch) urlMatch = text.match(/pin\.it\/[^\s]+/i);

  if (!urlMatch) {
    return reply('❌ Please provide a valid Pinterest URL!');
  }

  const pinterestUrl = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;

  try {
    // API URL using the provided endpoint
    const apiUrl = `https://api.nexray.eu.cc/downloader/pinterest?url=${encodeURIComponent(pinterestUrl)}`;

    const response = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.data || !response.data.status || !response.data.result) {
      return reply('❌ Invalid response from API or content not found.');
    }

    const pinData = response.data.result;
    const title = pinData.title || 'Pinterest Pin';
    
    // Check type of media
    const isVideo = !!pinData.video;
    const mediaUrl = pinData.video || pinData.image || pinData.url;

    if (!mediaUrl) {
      return reply('❌ No downloadable media URL found in the API response.');
    }

    // Custom caption with your requested text layout
    let caption = `📌 *Title:* ${title}\n\n`;
    caption += `1𝐷𝜣𝜨𝐿𝜣𝜟𝐷 𝐵𝜳 𝛧𝜜𝛪𝐷𝛪 𝛭𝐷📂`;

    if (isVideo) {
      // Download video content to buffer
      const videoResponse = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        timeout: 120000,
        maxContentLength: 100 * 1024 * 1024,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'video/mp4,video/*,*/*',
          'Referer': 'https://www.pinterest.com/'
        }
      });

      const videoBuffer = Buffer.from(videoResponse.data);

      await client.sendMessage(from, {
        video: videoBuffer,
        caption: caption
      }, { quoted: mek });

    } else {
      // Send image via URL directly
      await client.sendMessage(from, {
        image: { url: mediaUrl },
        caption: caption
      }, { quoted: mek });
    }

  } catch (error) {
    console.error('Pinterest Downloader Error:', error.message);
    reply(`❌ Failed to fetch content: ${error.message}`);
  }
});
    
