const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');
const config = require('../config');

cmd({
  pattern: "autobio",
  alias: ["bioauto", "setautobio"],
  react: "😎",
  category: "owner",
  desc: "Auto bio on/off",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, isOwner }) => {

  try {
    await conn.sendMessage(from, {
      react: { text: "😎", key: m.key }
    });

    // 🔐 Owner only
    if (!isOwner) {
      await conn.sendMessage(from, {
        react: { text: "❌", key: m.key }
      });
      return reply("❌ *Owner Only!*");
    }

    const state = q?.toLowerCase();

    // ❓ Help / status
    if (!state || !["on", "off"].includes(state)) {
      const display = `╭═══ 😎 AUTO BIO ═══⊷
┃❃╭──────────────
┃❃│ 📌 Status: ${global.autoBio ? "ON ✅" : "OFF ❌"}
┃❃│ 💡 Use: .autobio on/off
┃❃│ 📝 Example: .autobio on
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

    // ✅ Set state
    global.autoBio = state === "on";

    if (global.autoBio) {
      updateBio(conn);
    }

    const display = `╭═══ 😎 AUTO BIO ═══⊷
┃❃╭──────────────
┃❃│ ✅ Auto Bio ${state.toUpperCase()}
┃❃│ 📌 Status: ${global.autoBio ? "ON ✅" : "OFF ❌"}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

    await conn.sendMessage(from, {
      text: display,
      quoted: mek
    });

    await conn.sendMessage(from, {
      react: { text: "✅", key: m.key }
    });

  } catch (e) {
    console.log("AUTOBIO ERROR:", e);
    await conn.sendMessage(from, {
      react: { text: "❌", key: m.key }
    });
    reply("❌ *Error aa gaya*");
  }
});

// ================= BIO UPDATER =================
async function updateBio(conn) {
  if (!global.autoBio) return;

  try {
    const uptime = clockString(process.uptime() * 1000);
    const botname = config.BOT_NAME || "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪";

    const bio = `👑 ${botname} ACTIVE (${uptime}) 👑`;
    await conn.updateProfileStatus(bio);

    console.log("✅ BIO UPDATED:", bio);
  } catch (err) {
    console.log("❌ BIO UPDATE FAILED:", err.message);
  }

  // ⏱️ 1 minute loop
  setTimeout(() => updateBio(conn), 60 * 1000);
}

// ================= TIME FORMAT =================
function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;

  let str = "";
  if (d) str += `${d}D `;
  if (h) str += `${h}H `;
  if (m) str += `${m}M `;
  if (s) str += `${s}S`;
  return str.trim();
}