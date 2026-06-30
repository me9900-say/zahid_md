const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const axios = require('axios');

cmd({
  pattern: "apk",
  alias: ["app", "playstore", "application"],
  react: "☺️",
  desc: "📱 Download APK via Aptoide",
  category: "download",
  use: ".apk <name>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {

  try {
    await conn.sendMessage(from, {
      react: { text: "📱", key: m.key }
    });

    if (!q) {
      const display = `╭═══ 📱 APK DOWNLOADER ═══⊷
┃❃╭──────────────
┃❃│ ⚠️ No APK Name Provided
┃❃│ 💡 Use: .apk <app name>
┃❃│ 📝 Example: .apk whatsapp
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

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}/limit=1`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.datalist || !data.datalist.list.length) {
      const display = `╭═══ 📱 APK DOWNLOADER ═══⊷
┃❃╭──────────────
┃❃│ ❌ APK Not Found
┃❃│ 🔍 Try different name
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

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2);

    // Send APK Info
    const display = `╭═══ 📱 APK FOUND ═══⊷
┃❃╭──────────────
┃❃│ 📛 Name: ${app.name.toUpperCase()}
┃❃│ 📦 Size: ${appSize} MB
┃❃│ 📦 Package: ${app.package}
┃❃│ 🔢 Version: ${app.file.vername}
┃❃│ ⏳ Downloading...
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

    await conn.sendMessage(from, {
      text: display,
      quoted: mek
    });

    // Send Image
    await conn.sendMessage(from, {
      image: { url: app.icon },
      caption: `📱 *${app.name.toUpperCase()}*\n📦 *${appSize} MB*\n🔢 *${app.file.vername}*`
    }, { quoted: mek });

    // Send APK File
    await conn.sendMessage(from, {
      document: { url: app.file.path || app.file.path_alt },
      mimetype: "application/vnd.android.package-archive",
      fileName: `${app.name.toUpperCase()}.apk`
    }, { quoted: mek });

    await conn.sendMessage(from, {
      react: { text: "✅", key: m.key }
    });

  } catch (err) {
    console.error("APK Error:", err);
    await conn.sendMessage(from, {
      react: { text: "❌", key: m.key }
    });
    reply("❌ *APK Download Failed!*");
  }
});