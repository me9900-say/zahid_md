const { cmd } = require("../zaidi");
const axios = require('axios');

// Google Custom Search API Keys
const GCSE_KEY = 'AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI';
const GCSE_CX = 'baf9bdb0c631236e5';

cmd({
  pattern: "image",
  alias: ["img", "pic", "searchimage"],
  react: "🖼️",
  desc: "Search and send images from Google",
  category: "search",
  filename: __filename
}, async (client, mek, m, { from, sender, reply, body, prefix }) => {

  // Query extract karein
  const query = body.replace(new RegExp(`^${prefix}(image|img|pic|searchimage)\\s*`, 'i'), '').trim();
  
  if (!query) {
    return reply(`╭───(  IMAGE SEARCH  )───\n├ Give me something to search\n├ Example: ${prefix}img cats\n╰──────────────────☉`);
  }

  try {
    await reply(`⏳ Searching images for: *${query}*`);

    // Google Custom Search API call
    const { data } = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        q: query,
        key: GCSE_KEY,
        cx: GCSE_CX,
        searchType: 'image',
        num: 5,
        safe: 'off'
      },
      timeout: 15000
    });

    if (!data.items || data.items.length === 0) {
      return reply(`❌ No images found for "*${query}*"`);
    }

    // Images send karein
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      try {
        await client.sendMessage(from, {
          image: { url: item.link },
          caption: `╭───(  IMAGE ${i + 1}/${data.items.length}  )───\n├ Query: ${query}\n├ Title: ${(item.title || query).slice(0, 60)}\n╰──────────────────☉`
        });
        
        // Thoda delay between images
        if (i < data.items.length - 1) {
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (imgErr) {
        console.warn(`Image ${i + 1} skip: ${imgErr.message}`);
      }
    }

  } catch (error) {
    console.error('Image search error:', error.message);
    reply(`❌ Image search failed: ${error.message}`);
  }
});
