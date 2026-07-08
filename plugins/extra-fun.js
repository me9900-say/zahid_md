const { cmd } = require("../zaidi");

// Helper Functions
function getMatchMessage(score) {
  if (score > 800) return "Rab Ne Bana Di Jodi! ✨ Perfect Match.";
  if (score > 500) return "Bohat achi dosti aur acha bond hai! 👍";
  return "Thoda mushkil hai, guzaara hi hai! 😅";
}
function getEmojiPair(score) {
  return score > 700 ? "👑💖🔥" : "✨🤝💫";
}
function getAuraMessage(score) {
  if (score > 800) return "Sigma Rule Follower 🗿 (Ultimate Chad)";
  if (score > 400) return "Normal Aura, decent banda hai. 👍";
  return "Negative Aura! Chappal Chor Vibes 💀";
}
function getAuraEmoji(score) {
  return score > 800 ? "⚡🗿🔥" : "🥶🍃💀";
}
function getLoveEmoji(percent) {
  if (percent > 80) return "❤️🔥👩‍❤️‍👨";
  if (percent > 50) return "💛✨🤝";
  return "💔🥶🏃‍♂️";
}
function getLoveMessage(percent) {
  if (percent > 80) return "Sacha Pyar! Shadi pakki samjho. 💍";
  if (percent > 50) return "Chahat hai par nakhre bohat hain! 😜";
  return "Sirf Timepass! Katne wala hai aapka. 💀";
}

// ============================================
// 📌 COMPATIBILITY COMMAND
// ============================================
cmd({
  pattern: "compatibility",
  alias: ["friend", "fcheck", "match", "mutabiqat"],
  desc: "Check compatibility between two users.",
  category: "fun",
  react: "💖",
  filename: __filename,
  use: "@tag1 @tag2 or reply to message",
}, async (conn, mek, m, { args, reply }) => {
  try {
    let user1, user2;
    
    // Exact Mentions and Quoted Check
    let mentions = m.mentionedJid || mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedSender = m.quoted?.sender || mek.message?.extendedTextMessage?.contextInfo?.participant;

    if (quotedSender) {
      user1 = mek.sender;
      user2 = quotedSender;
    } 
    else if (mentions.length >= 2) {
      user1 = mentions[0];
      user2 = mentions[1];
    } 
    else {
      return reply(`⚠️ *Kindly do users ko tag karein ya kisi ke message par reply karein!*\n\n📌 *Tareeqa:*\n\`.compatibility @user1 @user2\`\nya\n\`kisi ke message par reply karke .compatibility likhein\``);
    }

    let compatibilityScore = Math.floor(Math.random() * 1000) + 1;
    let matchMsg = getMatchMessage(compatibilityScore);
    let emojiPair = getEmojiPair(compatibilityScore);
    
    let message = `━━━━━━━━━━━━━━━━━━━━\n💖 *COMPATIBILITY RESULT* 💖\n━━━━━━━━━━━━━━━━━━━━\n\n${emojiPair} *@${user1.split('@')[0]}* ❤️ *@${user2.split('@')[0]}*\n\n📊 *Compatibility Score:* \`${compatibilityScore}/1000\`\n\n🌟 *Result:* ${matchMsg}\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [user1, user2],
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// ============================================
// 📌 AURA COMMAND
// ============================================
cmd({
  pattern: "aura",
  alias: ["auracheck"],
  desc: "Calculate aura score of a user.",
  category: "fun",
  react: "💀",
  filename: __filename,
  use: "@tag or reply to message",
}, async (conn, mek, m, { args, reply }) => {
  try {
    let user;
    
    let mentions = m.mentionedJid || mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedSender = m.quoted?.sender || mek.message?.extendedTextMessage?.contextInfo?.participant;

    if (quotedSender) {
      user = quotedSender;
    } 
    else if (mentions.length >= 1) {
      user = mentions[0];
    } 
    else {
      user = mek.sender; // Agar kuch na ho to khud ka check karega
    }

    let auraScore = Math.floor(Math.random() * 1000) + 1;
    let auraMsg = getAuraMessage(auraScore);
    let auraEmoji = getAuraEmoji(auraScore);
    
    let message = `━━━━━━━━━━━━━━━━━━━━\n💀 *AURA CHECK* 💀\n━━━━━━━━━━━━━━━━━━━━\n\n${auraEmoji} *@${user.split('@')[0]}*\n\n⚡ *Aura Score:* \`${auraScore}/1000\` 🗿\n\n🌟 *Rank:* ${auraMsg}\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [user],
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// ============================================
// 📌 ROAST COMMAND
// ============================================
cmd({
  pattern: "roast",
  alias: ["jalao", "burn", "roastme"],
  desc: "Roast someone in style with epic roasts",
  category: "fun",
  react: "🔥",
  filename: __filename,
  use: "@tag or reply to message"
}, async (conn, mek, m, { reply }) => {
  try {
    let targetUser;
    
    let mentions = m.mentionedJid || mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedSender = m.quoted?.sender || mek.message?.extendedTextMessage?.contextInfo?.participant;

    if (quotedSender) {
      targetUser = quotedSender;
    } 
    else if (mentions.length >= 1) {
      targetUser = mentions[0];
    } 
    else {
      return reply(`⚠️ *Kindly kisi ko tag karein ya uske message par reply karein!*`);
    }

    let target = `@${targetUser.split("@")[0]}`;
    
    const roasts = [
      "Teri aqal WiFi signal se bhi kam hai! 📶",
      "Teri soch WhatsApp Status jaisi hai, 24 ghante baad ghaib ho jati hai! 📱",
      "Google par search karne se bhi tera naam nahi aata! 🔍",
      "Tera dimaag 2G network par chal raha hai! 📡",
      "Itna overthink mat kar, teri battery jaldi down ho jayegi! 🔋",
      "Tu VIP hai - 'Very Idiotic Person'! 👑",
      "Tera style wifi password jaisa hai, sab ko pata nahi! 🔐",
      "Tu software update se bhi nahi chalne wala, pura hang hai! 💻",
      "Teri personality dead battery jaisi hai! 🔌",
      "Tu apni zindagi ka sab se bada virus hai! 🦠",
      "🔥 Tumhari Personality WiFi Signal jaisi hai... qareeb aao to bhi Connect nahi hoti! 🤡",
      "🔥 Tum itne Unique ho ke Error bhi tumhein Ignore kar deta hai! 💀",
      "🔥 Mirror bhi tumhein dekh kar sochta hoga... 'System Failure!' 😂",
      "🔥 Tumhari Logic Windows XP se bhi purani lagti hai! 🪦",
      "🔥 Google bhi tumhein Search kar ke bole: 'No Results Found!' 😭",
      "🔥 Tumhara Face dekh kar Camera bhi Blur Mode On kar deta hai! 📸",
      "🔥 Tumhara Brain Loading... 1% Since Birth! 🧠",
      "🔥 Tumhara Reply Internet Explorer se bhi Late aata hai! 🌐",
      "🔥 Tumhara Talent Hidden nahi... Missing hai! 💀",
      "🔥 Tumhara Face Unlock bhi tumhein Reject kar deta hai! 📱"
    ];

    let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    let sender = `@${mek.sender.split("@")[0]}`;

    let header = `~꙳⎯꯭ͯ☆👀🍒🕊️.⃟‌ٖٖٖٖٖٖ♥️~\n🌸🌎🎋✿･✧\n💀 *ROAST MODE ACTIVATED...* 💀\n━━━━━━━━━━━━━━━━━━━━\n`;
    let footer = `\n━━━━━━━━━━━━━━━━━━━━\n🔥 Roast khatam... Magar tumhari be-izzati abhi bhi Running hai... ☠️\n\n𝆺𝅥𝐙ɑ͢ı֟፝𝛛ı֟፝𝆭⏤꯭٭»ً𐙚 🌚🔥`;

    let message = `${header}\n${sender} ne ${target} ko jala diya:\n\n💀 *${randomRoast}*\n${footer}`;

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [mek.sender, targetUser]
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// ============================================
// 📌 8BALL COMMAND
// ============================================
cmd({
  pattern: "8ball",
  alias: ["magicball", "ball"],
  desc: "Magic 8-Ball gives answers",
  category: "fun",
  react: "🎱",
  filename: __filename
}, async (conn, mek, m, { q, reply }) => {
  try {
    if (!q) {
      return reply(`🎱 *Jadui Gaind se poochein!*\n\n📌 *Tareeqa:*\n\`.8ball kya main aaj ameer hoon ga?\``);
    }

    const responses = [
      "🎱 *Ji Haan!* Bilkul! ✅",
      "🎱 *Nahi.* Aisa nahi hoga! ❌",
      "🎱 *Shayad...* Waqt bataye ga! ⏳",
      "🎱 *Yaqeenan!* 💯",
      "🎱 *Is pe umeed mat rakho!* 😅",
      "🎱 *Dobara poochein!* 🔮",
      "🎱 *Mere khayal mein nahi.* 🙅",
      "🎱 *Bila shakk-o-shubha!* 🎯"
    ];

    let answer = responses[Math.floor(Math.random() * responses.length)];
    let question = q.trim();

    let message = `━━━━━━━━━━━━━━━━━━━━\n🎱 *MAGIC 8-BALL* 🎱\n━━━━━━━━━━━━━━━━━━━━\n\n❓ *Sawal:* ${question}\n\n${answer}\n━━━━━━━━━━━━━━━━━━━━`;

    reply(message);

  } catch (error) {
    console.log(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// ============================================
// 📌 COMPLIMENT COMMAND
// ============================================
cmd({
  pattern: "compliment",
  alias: ["tareef", "nice"],
  desc: "Give a nice compliment",
  category: "fun",
  react: "😊",
  filename: __filename,
  use: "@tag or reply to message"
}, async (conn, mek, m, { reply }) => {
  try {
    let targetUser = null;
    
    let mentions = m.mentionedJid || mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedSender = m.quoted?.sender || mek.message?.extendedTextMessage?.contextInfo?.participant;

    if (quotedSender) {
      targetUser = quotedSender;
    } 
    else if (mentions.length >= 1) {
      targetUser = mentions[0];
    }

    const compliments = [
      "Tum jis tarah ho bilkul waise hi behtareen ho! 💖",
      "Tum har jagah roshni bikhairte ho! 🌟",
      "Tumhari muskurahat bohat pyaari hai! 😊",
      "Tum apne andaaz mein ba-salahiyat ho! 🧠",
      "Tumhari meherbani duniya ko behtar banati hai! ❤️",
      "Tum na-qabil-e-taqleed aur be-misaal ho! ✨",
      "Tum ek sache aur zabardast dost ho! 🤗"
    ];

    let randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    let sender = `@${mek.sender.split("@")[0]}`;
    
    let message;
    if (targetUser) {
      let target = `@${targetUser.split("@")[0]}`;
      message = `━━━━━━━━━━━━━━━━━━━━\n😊 *TAREEF KA LAMHA!* 😊\n━━━━━━━━━━━━━━━━━━━━\n\n${sender} ne ${target} ki tareef ki:\n\n🌟 *${randomCompliment}*\n━━━━━━━━━━━━━━━━━━━━`;
    } else {
      message = `━━━━━━━━━━━━━━━━━━━━\n😊 *AAP KE LIYE TAREEF!* 😊\n━━━━━━━━━━━━━━━━━━━━\n\n${sender}, aap ne kisi ko tag nahi kiya! Lekin aap ke liye:\n\n🌟 *${randomCompliment}*\n━━━━━━━━━━━━━━━━━━━━`;
    }

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [mek.sender, targetUser].filter(Boolean)
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// ============================================
// 📌 LOVE TEST COMMAND
// ============================================
cmd({
  pattern: "lovetest",
  alias: ["love", "mohabbat", "lt"],
  desc: "Check love compatibility between two users",
  category: "fun",
  react: "❤️",
  filename: __filename,
  use: "@tag1 @tag2 or reply to message"
}, async (conn, mek, m, { args, reply }) => {
  try {
    let user1, user2;
    
    let mentions = m.mentionedJid || mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedSender = m.quoted?.sender || mek.message?.extendedTextMessage?.contextInfo?.participant;

    if (quotedSender) {
      user1 = mek.sender;
      user2 = quotedSender;
    } 
    else if (mentions.length >= 2) {
      user1 = mentions[0];
      user2 = mentions[1];
    } 
    else {
      return reply(`⚠️ *Kindly do users ko tag karein ya kisi ke message par reply karein!*\n\n📌 *Tareeqa:*\n\`.lovetest @user1 @user2\``);
    }

    let lovePercent = Math.floor(Math.random() * 100) + 1;
    let loveEmoji = getLoveEmoji(lovePercent);
    let loveMsg = getLoveMessage(lovePercent);

    let result = `━━━━━━━━━━━━━━━━━━━━\n💘 *LOVE TEST* 💘\n━━━━━━━━━━━━━━━━━━━━\n\n${loveEmoji} *@${user1.split('@')[0]}* 💙 *@${user2.split('@')[0]}*\n\n💕 *Love Percentage:* \`${lovePercent}%\`\n\n📝 *Result:* ${loveMsg}\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, {
      text: result,
      mentions: [user1, user2]
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// ============================================
// 📌 EMOJI COMMAND
// ============================================
cmd({
  pattern: "emoji",
  alias: ["emojify"],
  desc: "Convert text into emoji form.",
  category: "fun",
  react: "🙂",
  filename: __filename,
  use: "<text>"
}, async (conn, mek, m, { q, reply }) => {
  try {
    if (!q) {
      return reply(`⚠️ *Kindly kuch text likhein!*\n\n📌 *Tareeqa:*\n\`.emoji Hello\``);
    }

    let text = q.trim();
    let emojiText = text.split('').map(char => {
      let lower = char.toLowerCase();
      const emojiMap = {
        'a': '🅰️', 'b': '🅱️', 'c': '🇨', 'd': '🇩', 'e': '🇪',
        'f': '🇫', 'g': '🇬', 'h': '🇭', 'i': '🇮', 'j': '🇯',
        'k': '🇰', 'l': '🇱', 'm': '🇲', 'n': '🇳', 'o': '🅾️',
        'p': '🇵', 'q': '🇶', 'r': '🇷', 's': '🇸', 't': '🇹',
        'u': '🇺', 'v': '🇻', 'w': '🇼', 'x': '🇽', 'y': '🇾',
        'z': '🇿', '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣',
        '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣',
        '9': '9️⃣', ' ': '  ', '!': '❗', '?': '❓', '.': '▪️'
      };
      return emojiMap[lower] || char;
    }).join('');

    let message = `━━━━━━━━━━━━━━━━━━━━\n🔄 *TEXT TO EMOJI* 🔄\n━━━━━━━━━━━━━━━━━━━━\n\n📝 *Original:* ${text}\n\n🎨 *Emoji Version:*\n${emojiText}\n━━━━━━━━━━━━━━━━━━━━`;
    reply(message);

  } catch (error) {
    console.log(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// ============================================
// 📌 FORTUNE COMMAND
// ============================================
cmd({
  pattern: "fortune",
  alias: ["qismat", "luck"],
  desc: "Tell your fortune",
  category: "fun",
  react: "🔮",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const fortunes = [
      "🔮 *Aaj ka din tumhara hai!* Kamyabi kadam choomegi! 🌟",
      "🔮 *Meherbani karo,* yeh lout kar tumhare paas aayegi! 💫",
      "🔮 *Ek naya mauqa* tumhara intezar kar raha hai! 🎯",
      "🔮 *Sabar karo,* acche din aane wale hain! 🌈",
      "🔮 *Tum bohat strong ho,* jo chaho hasil kar sakte ho! 💪"
    ];

    let fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    let user = mek.sender ? `@${mek.sender.split("@")[0]}` : "Dost";

    let message = `━━━━━━━━━━━━━━━━━━━━\n🔮 *QISMAT KI PREDICTION* 🔮\n━━━━━━━━━━━━━━━━━━━━\n\n👤 *For:* ${user}\n\n${fortune}\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [mek.sender]
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// ============================================
// 📌 MEME COMMAND
// ============================================
cmd({
  pattern: "meme",
  alias: ["memetext"],
  desc: "Generate random meme text",
  category: "fun",
  react: "😂",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const memes = [
      "😂 *Jab koi paper mein sirf apna naam likh kar pass ho jaye!* 📝",
      "😅 *Mujhe laga tha kal ka din mushkil tha, par aaj wala to us se bhi heavy nikla!* 🤦",
      "🤣 *Jab ammi ne poocha kya khao ge aur maine kaha 'Jo marzi bana lo'* 🍽️",
      "😂 *Main subha utha: Aaj bohat kaam karoon ga.*\n*Mera Bistar: Nahi tum nahi karo ge!* 🛏️"
    ];

    let meme = memes[Math.floor(Math.random() * memes.length)];
    let message = `━━━━━━━━━━━━━━━━━━━━\n😂 *MEME TIME!* 😂\n━━━━━━━━━━━━━━━━━━━━\n\n${meme}\n\n> 🎭 *Hansye aur Hansaiye!*\n━━━━━━━━━━━━━━━━━━━━`;
    reply(message);

  } catch (error) {
    console.log(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// ============================================
// 📌 RATE COMMAND
// ============================================
cmd({
  pattern: "rate",
  alias: ["rating", "checkrate"],
  desc: "Rate someone or something randomly",
  category: "fun",
  react: "⭐",
  filename: __filename,
  use: "@tag or reply to message"
}, async (conn, mek, m, { q, reply }) => {
  try {
    let targetUser;
    
    let mentions = m.mentionedJid || mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedSender = m.quoted?.sender || mek.message?.extendedTextMessage?.contextInfo?.participant;

    if (quotedSender) {
      targetUser = quotedSender;
    } 
    else if (mentions.length >= 1) {
      targetUser = mentions[0];
    } 
    else {
      targetUser = mek.sender;
    }

    let rateScore = Math.floor(Math.random() * 100) + 1;
    let stars = "⭐".repeat(Math.ceil(rateScore / 20)) || "⭐";
    let target = `@${targetUser.split("@")[0]}`;

    let message = `━━━━━━━━━━━━━━━━━━━━\n⭐ *RATING SYSTEM* ⭐\n━━━━━━━━━━━━━━━━━━━━\n\n👤 *Target:* ${target}\n\n📊 *Rating:* \`${rateScore}%\`\n✨ *Stars:* ${stars}\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [targetUser]
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});
