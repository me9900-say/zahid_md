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

  // 🔒 Sirf Owner ke liye
  if (!isCreator) return reply("❌ Sirf Owner ke liye ijazat hai!");

  let number = args[0];
  if (!number) return reply("📞 Misal: .simdata 0305XXXXXXX");

  // 🔧 Number Format Fix (API ke liye 305xxxx format me convert karna)
  // Agar +92, 92, ya 0 se start ho raha hai to usko hata dega
  number = number.replace(/^(0|\+?92)/, '');

  // 🛡️ Protected numbers (Ab bina 92 ke likhein kyunki format change ho gaya hai)
  const protectedNumbers = [
    "3308147104", // Pehle 923308147104 tha
    "3076755412"  // Pehle 923076755412 tha
  ];

  if (protectedNumbers.includes(number)) {
    return reply("🚫 Access Denied! Yeh number protected hai.");
  }

  try {
    // 🌐 API URL (Ab number 305xxxx format me jayega)
    const apiUrl = `https://rahmandatabase.vercel.app/api?number=${number}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return reply("❌ API me koi masla hai: " + response.status);
    }

    // 📥 Parse JSON Response
    const json = await response.json();

    // Check if data exists
    if (!json.success || !json.data || !json.data.data || !json.data.data.records || json.data.data.records.length === 0) {
      return reply("❌ Is number ka koi record nahi mila.");
    }

    const records = json.data.data.records;

    // ✅ ZAIDI-MD VIP Style Output
    let msg = `╭═══ 📱 𝐒𝐈𝐌 𝐃𝐀𝐓𝐀 ═══⊷\n`;
    msg += `┃❃╭──────────────\n`;
    msg += `┃❃│ 🔍 Talaash: ${number}\n`;
    msg += `┃❃│ 📊 Kul Records: ${records.length}\n`;

    // 🔄 Loop through all records and format them inside the box
    records.forEach((record, index) => {
      msg += `┃❃├──────────────\n`;
      msg += `┃❃│ 💎 RECORD NO: 0${index + 1}\n`;
      msg += `┃❃│ 👤 Naam: ${record.full_name || "N/A"}\n`;
      msg += `┃❃│ 📱 Mobile No: ${record.phone || "N/A"}\n`;
      msg += `┃❃│ 🆔 CNIC No: ${record.cnic || "N/A"}\n`;
      msg += `┃❃│ 🏠 Pata: ${record.address || "N/A"}\n`;
    });

    msg += `┃❃╰───────────────\n`;
    msg += `╰═════════════════⊷\n\n`;
    msg += `> © 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐙𝐀𝐈𝐃𝐈-𝐌𝐃`;

    await conn.sendMessage(from, { text: msg }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("❌ Data nikalne me nakami hui. Dobara koshish karein.");
  }
});
