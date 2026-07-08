const { cmd } = require("../zaidi");
const axios = require('axios');

cmd({
  pattern: "pinlink",
  alias: ["pin", "pindl", "pinterest", "pinterestdl"],
  react: "📥",
  desc: "Download images or videos from Pinterest via link",
  category: "media",
  filename: __filename
}, async (client, mek, m, { from, reply, body, prefix }) => {

  // Extract URL from input text using the new pattern name
  const text = body.replace(new RegExp(`^${prefix}(pinlink|pin|pindl|pinterest|pinterestdl)\\s*`, 'i'), '').trim();
  
  if (!text) {
    return reply(`📌 *Pinterest Downloader*\n\nUsage: ${prefix}pinlink <Pinterest URL>\nExample: ${prefix}pinlink https://pin.it/727sKM3cf`);
  }

  // Regex match Pinterest pin URLs
  let urlMatch = text.match(/https?:\/\/[^\s]*pinterest[^\s]*\/pin\/[^\s]+/i);
  if (!urlMatch) urlMatch = text.match(/https?:\/\/pin\.it\/[^\s]+/i);
  if (!urlMatch) urlMatch = text.match(/pin\.it\/[^\s]+/i);

  if (!urlMatch) {
    return reply('❌ Please provide a valid Pinterest URL!');
  }

  const pinterestUrl = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;

  try {
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
    
    const isVideo = !!pinData.video;
    const mediaUrl = pinData.video || pinData.image || pinData.url;

    if (!mediaUrl) {
      return reply('❌ No downloadable media URL found.');
    }

    // Custom caption footer
    let caption = `📌 *Title:* ${title}\n\n`;
    caption += `1𝐷𝜣𝜨𝐿𝜣𝜟𝐷 𝐵𝜳 𝛧𝜜𝛪𝐷𝛪 𝛭𝐷📂`;

    if (isVideo) {
      // Fetching the video manually with strict headers
      const videoResponse = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        timeout: 120000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'video/mp4,video/*;q=0.9',
          'Referer': 'https://www.pinterest.com/'
        }
      });

      const videoBuffer = Buffer.from(videoResponse.data);

      if (!videoBuffer || videoBuffer.length < 5000) {
        return reply('❌ Video fetching failed or data is incomplete.');
      }

      // Sending buffer with filename to force WhatsApp engine parsing
      await client.sendMessage(from, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        fileName: 'video.mp4',
        caption: caption
      }, { quoted: mek });

    } else {
      // Send image via direct URL structure
      await client.sendMessage(from, {
        image: { url: mediaUrl },
        caption: caption
      }, { quoted: mek });
    }

  } catch (error) {
    console.error('Pinterest Downloader Error:', error.message);
    reply(`❌ Error processing request: ${error.message}`);
  }
});
