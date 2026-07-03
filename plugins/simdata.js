const { cmd } = require('../zaidi');
const fetch = require('node-fetch');

cmd({
  pattern: "simdata",
  alias: ["sdata", "siminfo"],
  react: "🗯️",
  desc: "Fetch SIM data by number (Owner only).",
  category: "utility",
  filename: __filename
}, async (conn, mek, m, { from, isCreator, args, reply }) => {

  // 🔒 Only owner
  if (!isCreator) return reply("❌ Owner only command!");

  let number = args[0];
  if (!number) return reply("📞 Example: .simdata 034XXXXXXXXX");

  // 🔧 Normalize number (03 → 92)
  if (number.startsWith("03")) {
    number = "92" + number.slice(1);
  }

  // 🛡️ Protected numbers
  const protectedNumbers = [
    "923315462969",
    "923076755412"
  ];

  if (protectedNumbers.includes(number)) {
    return reply("🚫 Access Denied! Protected number.");
  }

  try {
    // 🌐 New API URL
    const apiUrl = `https://rahmandatabase.vercel.app/api?number=${number}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return reply("❌ API Error: " + response.status);
    }

    // 📥 Parse JSON Response
    const json = await response.json();

    // Check if data exists
    if (!json.success || !json.data || !json.data.data || !json.data.data.records || json.data.data.records.length === 0) {
      return reply("❌ No record found for this number.");
    }

    const records = json.data.data.records;

    // ✅ Format Output Header
    let msg = `*╭┈───〔 ꜱɪᴍ ᴅᴀᴛᴀ 〕┈───⊷*\n`;
    msg += `*├▢ 📱 Searched:* ${number}\n`;
    msg += `*├▢ 📊 Total Records:* ${records.length}\n`;
    msg += `*╰─────────────*\n\n`;

    // 🔄 Loop through all found records
    records.forEach((record, index) => {
      msg += `*     〔 RECORD ${index + 1} 〕*\n`;
      msg += `*▢ 👤 Name:* ${record.full_name || "N/A"}\n`;
      msg += `*▢ 📱 Number:* ${record.phone || "N/A"}\n`;
      msg += `*▢ 🆔 CNIC:* ${record.cnic || "N/A"}\n`;
      msg += `*▢ 🏠 Address:* ${record.address || "N/A"}\n`;
      msg += `*─────────────────*\n\n`;
    });

    msg += `⚠️ _Data from: ${json.source || "Public Source"}_`;

    await conn.sendMessage(from, { text: msg }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("❌ Failed to fetch data. Something went wrong.");
  }
});
