const config = require('../config')
const { cmd, commands } = require('../zaidi')
const { getBuffer, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
  pattern: "updategdesc",
  alias: ["gdesc", "setdesc", "groupdesc"],
  desc: "Change the group description",
  category: "group",
  react: "📜",
  filename: __filename
}, async (conn, mek, m, {
  from,
  isCreator,
  isBotAdmins,
  isAdmins,
  isGroup,
  q,
  reply
}) => {
  try {
    if (!isGroup) return await reply("⚠️ This command only works in groups.");
    if (!isBotAdmins) return await reply("❌ I must be admin to change group description.");
    if (!isAdmins && !isCreator) return await reply("🔐 Only admins can use this command.");
    
    if (!q) return await reply("❌ Please provide a new group description.\nExample: `gdesc Welcome to our group!`");

    // Limit description length
    if (q.length > 500) {
      return await reply("⚠️ Description is too long (max 500 characters).");
    }

    await conn.groupUpdateDescription(from, q);
    await reply("✅ Group description updated successfully!");

  } catch (err) {
    console.error(err);
    await reply("❌ Failed to update group description.");
  }
});
