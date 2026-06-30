const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const axios = require('axios');

cmd({
  pattern: "screenshot",
  alias: ["ss", "webshot", "sitepic"],
  react: "🖥️",
  category: "tools",
  desc: "Take full HD desktop screenshot of a website",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    await conn.sendMessage(from, {
      react: { text: "🖥️", key: m.key }
    });

    if (!q) {
      const display = `*🖥️ WEBSITE SCREENSHOT COMMAND*\n\nUse is tarah:\n*.screenshot <website URL>*\n\nExample:\n*.screenshot https://google.com*`;

      await conn.sendMessage(from, {
        react: { text: "❌", key: m.key }
      });
      return reply(display);
    }

    const apiUrl = `https://movanest.xyz/v2/ssweb?url=${encodeURIComponent(q)}&width=1280&height=720&full_page=true`;
    const res = await axios.get(apiUrl, { timeout: 60000 });

    if (!res.data || !res.data.status || !res.data.screenshot) {
      await conn.sendMessage(from, {
        react: { text: "❌", key: m.key }
      });
      return reply("❌ Screenshot generate nahi hua / API se response nahi aaya");
    }

    const screenshotUrl = res.data.screenshot;

    await conn.sendMessage(from, {
      image: { url: screenshotUrl },
      caption: `🖥️ Screenshot of: ${q}`
    }, { quoted: mek });

    await conn.sendMessage(from, {
      react: { text: "✅", key: m.key }
    });

  } catch (err) {
    console.error("SCREENSHOT COMMAND ERROR:", err.message);
    await conn.sendMessage(from, {
      react: { text: "❌", key: m.key }
    });
    reply("❌ Screenshot generate nahi hua / API busy");
  }
});