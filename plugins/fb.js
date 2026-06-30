const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const axios = require('axios');

cmd({
  pattern: "fb",
  react: "☺️",
  alias: ["facebook", "fbdl"],
  category: "download",
  desc: "📥 Download Facebook videos",
  use: ".fb <video link>",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {

  try {
    await conn.sendMessage(from, {
      react: { text: "📥", key: m.key }
    });

    if (!q) {
      const display = `╭═══ 📥 FB DOWNLOADER ═══⊷
┃❃╭──────────────
┃❃│ ❌ No Link Provided
┃❃│ 💡 Use: .fb <facebook link>
┃❃│ 📝 Example: .fb https://fb.watch/xxxxx
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

      await conn.sendMessage(from, {
        text: display,
        quoted: mek
      });

      await conn.sendMessage(from, {
        react: { text: "⚠️", key: m.key }
      });

      return;
    }

    const loading = `╭═══ 📥 FB DOWNLOADER ═══⊷
┃❃╭──────────────
┃❃│ ⏳ Downloading...
┃❃│ 🔗 Processing...
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

    await conn.sendMessage(from, {
      text: loading,
      quoted: mek
    });

    const apiUrl = `https://movanest.xyz/v2/fbdown?url=${encodeURIComponent(q)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    // 🔎 API status check
    if (data.status !== true) {
      return reply("❌ *API Error!*");
    }

    // 🔎 Results check
    if (!Array.isArray(data.results) || data.results.length === 0) {
      const display = `╭═══ 📥 FB DOWNLOADER ═══⊷
┃❃╭──────────────
┃❃│ ❌ Video Not Found
┃❃│ 🔍 Check your link
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

      await conn.sendMessage(from, {
        text: display,
        quoted: mek
      });

      await conn.sendMessage(from, {
        react: { text: "❌", key: m.key }
      });

      return;
    }

    const result = data.results[0];

    // 🎥 Quality selection
    const videoUrl = result.hdQualityLink
      ? result.hdQualityLink
      : result.normalQualityLink;

    if (!videoUrl) {
      return reply("❌ *Video link not found!*");
    }

    // 📝 Caption
    const caption = `╭═══ 📥 FB VIDEO ═══⊷
┃❃╭──────────────
┃❃│ 👑 Quality: ${result.hdQualityLink ? "HD" : "Normal"}
┃❃│ ⏱️ Duration: ${result.duration || "Unknown"}
┃❃│ 👤 Creator: ${data.creator || "Unknown"}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

    await conn.sendMessage(
      from,
      {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption: caption
      },
      { quoted: mek }
    );

    await conn.sendMessage(from, {
      react: { text: "✅", key: m.key }
    });

  } catch (err) {
    console.log("FB ERROR:", err);
    await conn.sendMessage(from, {
      react: { text: "❌", key: m.key }
    });
    reply("❌ *Error aa gaya!*");
  }
});