const { cmd } = require("../zaidi");

// ============================================
// 📌 COMPATIBILITY COMMAND - مطابقت کی جانچ
// ============================================
cmd({
  pattern: "compatibility",
  alias: ["friend", "fcheck", "match", "مطابقت"],
  desc: "Calculate the compatibility score between two users.",
  category: "fun",
  react: "💖",
  filename: __filename,
  use: "@tag1 @tag2 or reply to message",
}, async (conn, mek, m, { args, reply }) => {
  try {
    let user1, user2;
    
    // Check if replying to a message
    if (mek.quoted && mek.quoted.sender) {
      user1 = mek.sender;
      user2 = mek.quoted.sender;
    } 
    // Check if tagged users
    else if (m.mentionedJid && m.mentionedJid.length >= 2) {
      user1 = m.mentionedJid[0];
      user2 = m.mentionedJid[1];
    } 
    else {
      return reply(`⚠️ *براہ کرم دو صارفین کو ٹیگ کریں یا کسی کے میسج پر ریپلائی کریں!*\n\n📌 *طریقہ استعمال:*\n\`\`\`.compatibility @user1 @user2\`\`\`\nیا\n\`\`\`کسی کے میسج پر ریپلائی کریں اور .compatibility ٹائپ کریں\`\`\``);
    }

    let compatibilityScore = Math.floor(Math.random() * 1000) + 1;
    let matchMsg = getMatchMessage(compatibilityScore);
    let emojiPair = getEmojiPair(compatibilityScore);
    
    let message = `━━━━━━━━━━━━━━━━━━━━\n💖 *مطابقت کا نتیجہ* 💖\n━━━━━━━━━━━━━━━━━━━━\n\n${emojiPair} *@${user1.split('@')[0]}* ❤️ *@${user2.split('@')[0]}*\n\n📊 *مطابقت کا تناسب:* \`${compatibilityScore}/1000\`\n\n🌟 *نتیجہ:* ${matchMsg}\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [user1, user2],
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *خرابی:* ${error.message}`);
  }
});

// ============================================
// 📌 AURA COMMAND - عارضہ کی جانچ
// ============================================
cmd({
  pattern: "aura",
  alias: ["auracheck", "عارضہ"],
  desc: "Calculate aura score of a user.",
  category: "fun",
  react: "💀",
  filename: __filename,
  use: "@tag or reply to message",
}, async (conn, mek, m, { args, reply }) => {
  try {
    let user;
    
    // Check if replying to a message
    if (mek.quoted && mek.quoted.sender) {
      user = mek.quoted.sender;
    } 
    // Check if tagged user
    else if (m.mentionedJid && m.mentionedJid.length >= 1) {
      user = m.mentionedJid[0];
    } 
    else {
      return reply(`⚠️ *براہ کرم کسی صارف کو ٹیگ کریں یا کسی کے میسج پر ریپلائی کریں!*\n\n📌 *طریقہ استعمال:*\n\`\`\`.aura @user\`\`\`\nیا\n\`\`\`کسی کے میسج پر ریپلائی کریں اور .aura ٹائپ کریں\`\`\``);
    }

    let auraScore = Math.floor(Math.random() * 1000) + 1;
    let auraMsg = getAuraMessage(auraScore);
    let auraEmoji = getAuraEmoji(auraScore);
    
    let message = `━━━━━━━━━━━━━━━━━━━━\n💀 *عارضہ کی جانچ* 💀\n━━━━━━━━━━━━━━━━━━━━\n\n${auraEmoji} *@${user.split('@')[0]}*\n\n⚡ *عارضہ سکور:* \`${auraScore}/1000\` 🗿\n\n🌟 *درجہ:* ${auraMsg}\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [user],
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *خرابی:* ${error.message}`);
  }
});

// ============================================
// 📌 ROAST COMMAND - جلانا (Ultimate Edition)
// ============================================
cmd({
  pattern: "roast",
  alias: ["jalao", "جلاؤ", "burn", "roastme"],
  desc: "Roast someone in style with epic roasts",
  category: "fun",
  react: "🔥",
  filename: __filename,
  use: "@tag or reply to message"
}, async (conn, mek, m, { reply }) => {
  try {
    let targetUser;
    
    // Check if replying to a message
    if (mek.quoted && mek.quoted.sender) {
      targetUser = mek.quoted.sender;
    } 
    // Check if tagged user
    else if (m.mentionedJid && m.mentionedJid.length >= 1) {
      targetUser = m.mentionedJid[0];
    } 
    else {
      return reply(`⚠️ *براہ کرم کسی کو ٹیگ کریں یا کسی کے میسج پر ریپلائی کریں!*\n\n📌 *طریقہ استعمال:*\n\`\`\`.roast @user\`\`\`\nیا\n\`\`\`کسی کے میسج پر ریپلائی کریں اور .roast ٹائپ کریں\`\`\``);
    }

    let target = `@${targetUser.split("@")[0]}`;
    
    const roasts = [
      // 🔥 CLASSIC ROASTS
      "تیری عقل وائی فائی سگنل سے بھی کم ہے! 📶",
      "تیری سوچ واٹس ایپ سٹیٹس جیسی ہے، 24 گھنٹے بعد غائب ہو جاتی ہے! 📱",
      "گوگل پر سرچ کرنے سے بھی تیرا نام نہیں آتا! 🔍",
      "تیرا دماغ 2G نیٹ ورک پر چل رہا ہے! 📡",
      "اتنا اوور تھنک مت کر، تیری بیٹری جلدی ڈاؤن ہو جائے گی! 🔋",
      "تو VIP ہے - 'Very Idiotic Person'! 👑",
      "تیرا سٹائل وائی فائی پاسورڈ جیسا ہے، سب کو پتہ نہیں! 🔐",
      "تو سافٹ ویئر اپ ڈیٹ بھی نہیں چلنے والا، پورا ہینگ ہے! 💻",
      "تیری پرسنالٹی ڈیڈ بیٹری جیسی ہے! 🔌",
      "تو اپنی زندگی کا سب سے بڑا وائرس ہے! 🦠",
      "تیرا برین بروکن لنک جیسا ہے، کچھ نہیں ملتا! 🔗",
      "تیری تصویر سکرین شاٹ لگتی ہے، اصلی میں تو کچھ بھی نہیں! 📸",
      "تو لگتا تو آئی فون ہے، لیکن اندر پرانا اینڈرائیڈ ہے! 📱",
      "تیرے چہرے پے 'لوڈنگ' لکھا ہے، پر کبھی کمپلیٹ نہیں ہوتا! ⏳",
      "تو '404 Not Found' کی زندہ مثال ہے! ❌",
      
      // 🔥 EPIC ROASTS
      "🔥 تمہاری Personality WiFi Signal جیسی ہے... قریب آؤ تو بھی Connect نہیں ہوتی! 🤡",
      "🔥 تم اتنے Unique ہو کہ Error بھی تمہیں Ignore کر دیتا ہے! 💀",
      "🔥 Mirror بھی تمہیں دیکھ کر سوچتا ہوگا... 'System Failure!' 😂",
      "🔥 تمہاری Logic Windows XP سے بھی پرانی لگتی ہے! 🪦",
      "🔥 Google بھی تمہیں Search کر کے بولے: 'No Results Found!' 😭",
      "🔥 تمہاری Speed دیکھ کر Turtle نے بھی Overtake کر لیا! 🐢",
      "🔥 تمہارا Confidence دیکھ کر Failure بھی شرما جائے! 🤣",
      "🔥 تمہارا IQ Calculator میں Negative آتا ہے! 💀",
      "🔥 تمہاری باتیں سن کر Headphones بھی Disconnect ہو جائیں! 🎧",
      "🔥 تمہارا Face دیکھ کر Camera بھی Blur Mode On کر دیتا ہے! 📸",
      "🔥 تم اتنے Lucky ہو کہ Misfortune بھی تمہیں Avoid کرتی ہے! 😂",
      "🔥 تمہاری Planning ہمیشہ 'Coming Soon' پر ہی رہتی ہے! 🚧",
      "🔥 تمہارا Attitude Free Trial جیسا ہے... زیادہ دیر نہیں چلتا! 😭",
      "🔥 تمہاری Smile دیکھ کر Dentist بھی Resign کر دے! 🦷",
      "🔥 تمہارا Brain Loading... 1% Since Birth! 🧠",
      "🔥 تمہاری Story دیکھ کر Boredom بھی Skip کر دے! 😴",
      "🔥 تمہارا Fashion Sense Offline رہتا ہے! 👕",
      "🔥 تمہارا Reply Internet Explorer سے بھی Late آتا ہے! 🌐",
      "🔥 تمہارا Talent Hidden نہیں... Missing ہے! 💀",
      "🔥 تمہاری Destiny بھی بولتی ہوگی: 'I'm Done!' 🤡",
      "🔥 تمہارے Excuses Netflix Series سے بھی لمبے ہوتے ہیں! 📺",
      "🔥 تمہارا Mood Weather Forecast سے بھی زیادہ Confusing ہے! 🌦️",
      "🔥 تمہارا Face Unlock بھی تمہیں Reject کر دیتا ہے! 📱",
      "🔥 تمہاری Memory RAM نہیں... Calculator History جتنی ہے! 🧮",
      "🔥 تمہارا Style Copy ہے... Original صرف Problem ہے! 😭",
      "🔥 تمہارا Luck Airplane Mode میں چل رہا ہے! ✈️",
      "🔥 تمہاری سوچ Buffering میں ہی زندگی گزار دیتی ہے! ⏳",
      "🔥 تمہارا Future دیکھ کر Horoscope بھی Logout ہو جائے! 🌙",
      "🔥 تم اتنے بے مثال ہو کہ Example بھی نہیں بنتے! 🤣",
      
      // 🔥 ULTIMATE ROASTS
      "🔥 تمہارا Presence دیکھ کر Ghost بھی ڈر جائے! 👻",
      "🔥 تمہاری Voice سن کر Siri بھی غلط جواب دے! 🗣️",
      "🔥 تمہارے Jokes سن کر Stand-up Comedian بھی Retire ہو جائے! 🎤",
      "🔥 تمہارا Cooking دیکھ کر Chef بھی Fridge بند کر دے! 🍳",
      "🔥 تمہاری Dancing دیکھ کر Michael Jackson بھی Bed pe ja jaye! 💃",
      "🔥 تمہارا Singing سن کر Nightingale بھی Quit کر دے! 🎵",
      "🔥 تمہاری Painting دیکھ کر Picasso بھی Ro پڑے! 🎨",
      "🔥 تمہارا Driving دیکھ کر GPS بھی Confused ہو جائے! 🚗",
      "🔥 تمہاری Photography دیکھ کر Camera بھی Shutter بند کر دے! 📷",
      "🔥 تمہارا Handwriting دیکھ کر Doctor بھی Prescription نہ سمجھ پائے! ✍️",
      "🔥 تمہاری Fashion دیکھ کر Mannequin بھی گھبرا جائے! 👗",
      "🔥 تمہارا Makeup دیکھ کر Mirror بھی Crack ہو جائے! 💄",
      "🔥 تمہاری Beard دیکھ کر Barber بھی Razor پھینک دے! 🪒",
      "🔥 تمہارا Haircut دیکھ کر Stylist بھی Hair Color بھول جائے! 💇",
      "🔥 تمہارا Walk دیکھ کر Model بھی Runway چھوڑ دے! 🚶",
      "🔥 تمہاری Attitude دیکھ کر Attitude بھی Attitude Change کر لے! 😎",
      "🔥 تمہارا Swag دیکھ کر Swag بھی بھاگ جائے! 🏃",
      "🔥 تمہارا Game دیکھ کر Gamer بھی Uninstall کر دے! 🎮",
      "🔥 تمہارا Code دیکھ کر Debugger بھی ہار مان جائے! 💻",
      "🔥 تمہارا Password دیکھ کر Hacker بھی Leave کر دے! 🔓",
      "🔥 تمہاری Life دیکھ کر Hollywood بھی Script Change کر دے! 🎬",
      "🔥 تمہاری Story دیکھ کر Novelist بھی Book بند کر دے! 📖",
      "🔥 تمہاری Poetry سن کر Shakespeare بھی Blank Verse بھول جائے! 📝",
      "🔥 تمہارا Philosophy سن کر Socrates بھی Poison پی لے! 🧠",
      "🔥 تمہارا Logic دیکھ کر Einstein بھی Theory بدل دے! 🔬",
      "🔥 تمہارا Math دیکھ کر Calculator بھی Error دے! 🧮",
      "🔥 تمہاری Biology دیکھ کر Darwin بھی Evolution بھول جائے! 🧬",
      "🔥 تمہاری Chemistry دیکھ کر Periodic Table بھی P-Table بن جائے! ⚗️",
      "🔥 تمہاری Physics دیکھ کر Newton بھی Apple گرائے! 🍎",
      "🔥 تمہاری History دیکھ کر Historian بھی Future میں چلا جائے! 📜"
    ];

    let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    let sender = `@${mek.sender.split("@")[0]}`;

    let header = `~꙳⎯꯭ͯ☆👀🍒🕊️.⃟‌ٖٖٖٖٖٖ♥️~\n🌸🌎🎋✿･✧\n💀 *ROAST MODE ACTIVATED...* 💀\n━━━━━━━━━━━━━━━━━━━━\n`;
    let footer = `\n━━━━━━━━━━━━━━━━━━━━\n🔥 Roast ختم... مگر تمہاری بے عزتی ابھی بھی Running ہے... ☠️\n\n𝆺𝅥𝐙ɑ͢ı֟፝𝛛֟ı֟፝𝆭⏤꯭٭»ً𐙚 🌚🔥`;

    let message = `${header}\n${sender} نے ${target} کو جلایا:\n\n💀 *${randomRoast}*\n${footer}`;

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [mek.sender, targetUser]
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *خرابی:* ${error.message}`);
  }
});

// ============================================
// 📌 8BALL COMMAND - جادوئی گیند
// ============================================
cmd({
  pattern: "8ball",
  alias: ["magicball", "ball", "گیند"],
  desc: "Magic 8-Ball gives answers",
  category: "fun",
  react: "🎱",
  filename: __filename
}, async (conn, mek, m, { q, reply }) => {
  try {
    if (!q) {
      return reply(`🎱 *جادوئی گیند سے پوچھیں!*\n\n📌 *طریقہ استعمال:*\n\`\`\`.8ball کیا میں آج امیر ہوں گا؟\`\`\``);
    }

    const responses = [
      "🎱 *جی ہاں!* بالکل! ✅",
      "🎱 *نہیں.* ایسا نہیں ہوگا! ❌",
      "🎱 *شاید...* وقت بتائے گا! ⏳",
      "🎱 *یقیناً!* 💯",
      "🎱 *اس پے مت گنو!* 😅",
      "🎱 *دوبارہ پوچھیں!* 🔮",
      "🎱 *میرے خیال میں نہیں.* 🙅",
      "🎱 *بلا شک و شبہ!* 🎯",
      "🎱 *یقینی ہے!* 💫",
      "🎱 *امکانات کم ہیں.* 🌧️",
      "🎱 *بہت ممکن ہے!* 🌟",
      "🎱 *ابھی نہیں، بعد میں!* ⏰"
    ];

    let answer = responses[Math.floor(Math.random() * responses.length)];
    let question = q.trim();

    let message = `━━━━━━━━━━━━━━━━━━━━\n🎱 *جادوئی گیند* 🎱\n━━━━━━━━━━━━━━━━━━━━\n\n❓ *سوال:* ${question}\n\n${answer}\n━━━━━━━━━━━━━━━━━━━━`;

    reply(message);

  } catch (error) {
    console.log(error);
    reply(`❌ *خرابی:* ${error.message}`);
  }
});

// ============================================
// 📌 COMPLIMENT COMMAND - تعریف
// ============================================
cmd({
  pattern: "compliment",
  alias: ["tareef", "تعریف", "nice"],
  desc: "Give a nice compliment",
  category: "fun",
  react: "😊",
  filename: __filename,
  use: "@tag or reply to message"
}, async (conn, mek, m, { reply }) => {
  try {
    let targetUser = null;
    
    // Check if replying to a message
    if (mek.quoted && mek.quoted.sender) {
      targetUser = mek.quoted.sender;
    } 
    // Check if tagged user
    else if (m.mentionedJid && m.mentionedJid.length >= 1) {
      targetUser = m.mentionedJid[0];
    }

    const compliments = [
      "تم جس طرح ہو بالکل ویسے ہی بہترین ہو! 💖",
      "تم ہر جگہ روشنی بکھیرتے ہو! 🌟",
      "تمہاری مسکراہٹ متعدی ہے! 😊",
      "تم اپنے انداز میں باصلاحیت ہو! 🧠",
      "تم ہر ایک کو خوشی دیتے ہو! 🥰",
      "تم انسانیت کی شکل ہو! ☀️",
      "تمہاری مہربانی دنیا کو بہتر بناتی ہے! ❤️",
      "تم ناقابلِ تقلید اور بے مثال ہو! ✨",
      "تم بہترین سننے والے اور زبردست دوست ہو! 🤗",
      "تمہارے مثبت خیالات واقعی متاثر کن ہیں! 💫",
      "تم جتنے مضبوط ہو اس سے زیادہ نہیں! 💪",
      "تمہاری تخلیقی صلاحیتیں حیرت انگیز ہیں! 🎨",
      "تم زندگی کو مزیدار اور دلچسپ بناتے ہو! 🎉",
      "تمہاری توانائی ہر ایک کو بلند کرتی ہے! 🔥",
      "تم ایک حقیقی لیڈر ہو، چاہے تم جانتے ہو یا نہیں! 🏆",
      "تم اتنی صلاحیت رکھتے ہو، دنیا کو تمہاری ضرورت ہے! 🎭",
      "تم اس بات کا ثبوت ہو کہ مہربانی اب بھی موجود ہے! 💕",
      "تم مشکل دنوں کو بھی روشن کر دیتے ہو! ☀️",
      "تمہاری موجودگی سے ہر کوئی خوش ہوتا ہے! 🌈",
      "تم ایک حقیقی ہیرو ہو، بغیر کیپ کے! 🦸"
    ];

    let randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    let sender = `@${mek.sender.split("@")[0]}`;
    
    let message;
    if (targetUser) {
      let target = `@${targetUser.split("@")[0]}`;
      message = `━━━━━━━━━━━━━━━━━━━━\n😊 *تعریف کا لمحہ!* 😊\n━━━━━━━━━━━━━━━━━━━━\n\n${sender} نے ${target} کی تعریف کی:\n\n🌟 *${randomCompliment}*\n━━━━━━━━━━━━━━━━━━━━`;
    } else {
      message = `━━━━━━━━━━━━━━━━━━━━\n😊 *آپ کے لیے تعریف!* 😊\n━━━━━━━━━━━━━━━━━━━━\n\n${sender}, آپ نے کسی کو ٹیگ نہیں کیا! لیکن آپ کے لیے:\n\n🌟 *${randomCompliment}*\n━━━━━━━━━━━━━━━━━━━━`;
    }

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [mek.sender, targetUser].filter(Boolean)
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *خرابی:* ${error.message}`);
  }
});

// ============================================
// 📌 LOVE TEST COMMAND - محبت کا امتحان
// ============================================
cmd({
  pattern: "lovetest",
  alias: ["love", "محبت", "lt"],
  desc: "Check love compatibility between two users",
  category: "fun",
  react: "❤️",
  filename: __filename,
  use: "@tag1 @tag2 or reply to message"
}, async (conn, mek, m, { args, reply }) => {
  try {
    let user1, user2;
    
    // Check if replying to a message
    if (mek.quoted && mek.quoted.sender) {
      user1 = mek.sender;
      user2 = mek.quoted.sender;
    } 
    // Check if tagged users
    else if (m.mentionedJid && m.mentionedJid.length >= 2) {
      user1 = m.mentionedJid[0];
      user2 = m.mentionedJid[1];
    } 
    else {
      return reply(`⚠️ *براہ کرم دو صارفین کو ٹیگ کریں یا کسی کے میسج پر ریپلائی کریں!*\n\n📌 *طریقہ استعمال:*\n\`\`\`.lovetest @user1 @user2\`\`\`\nیا\n\`\`\`کسی کے میسج پر ریپلائی کریں اور .lovetest ٹائپ کریں\`\`\``);
    }

    let lovePercent = Math.floor(Math.random() * 100) + 1;
    let loveEmoji = getLoveEmoji(lovePercent);
    let loveMsg = getLoveMessage(lovePercent);

    let result = `━━━━━━━━━━━━━━━━━━━━\n💘 *محبت کا امتحان* 💘\n━━━━━━━━━━━━━━━━━━━━\n\n${loveEmoji} *@${user1.split('@')[0]}* 💙 *@${user2.split('@')[0]}*\n\n💕 *محبت کا تناسب:* \`${lovePercent}%\`\n\n📝 *نتیجہ:* ${loveMsg}\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, {
      text: result,
      mentions: [user1, user2]
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *خرابی:* ${error.message}`);
  }
});

// ============================================
// 📌 EMOJI COMMAND - ایموجی کنورٹر
// ============================================
cmd({
  pattern: "emoji",
  alias: ["emojify", "ایموجی"],
  desc: "Convert text into emoji form.",
  category: "fun",
  react: "🙂",
  filename: __filename,
  use: "<text>"
}, async (conn, mek, m, { q, reply }) => {
  try {
    if (!q) {
      return reply(`⚠️ *براہ کرم متن فراہم کریں!*\n\n📌 *طریقہ استعمال:*\n\`\`\`.emoji Hello World\`\`\``);
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
        '9': '9️⃣', ' ': '  ', '!': '❗', '?': '❓', '.': '▪️',
        ',': '🔹', '-': '➖', '_': '🔲', '@': '🅰️', '#': '#️⃣'
      };
      return emojiMap[lower] || char;
    }).join('');

    if (!emojiText.trim()) {
      return reply("⚠️ *کوئی درست حرف نہیں ملا!*");
    }

    let message = `━━━━━━━━━━━━━━━━━━━━\n🔄 *متن سے ایموجی* 🔄\n━━━━━━━━━━━━━━━━━━━━\n\n📝 *اصل متن:*\n${text}\n\n🎨 *ایموجی ورژن:*\n${emojiText}\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, { text: message }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *خرابی:* ${error.message}`);
  }
});

// ============================================
// 📌 FORTUNE COMMAND - قسمت بتاؤ
// ============================================
cmd({
  pattern: "fortune",
  alias: ["qismat", "قسمت", "luck"],
  desc: "Tell your fortune",
  category: "fun",
  react: "🔮",
  filename: __filename
}, async (conn, mek, m, { q, reply }) => {
  try {
    const fortunes = [
      "🔮 *آج کا دن تمہارا ہے!* کامیابی تمہارے قدم چومے گی! 🌟",
      "🔮 *مہربانی کرو،* کیونکہ یہ تمہارے پاس واپس آئے گی! 💫",
      "🔮 *ایک نیا موقع* تمہارا انتظار کر رہا ہے! 🎯",
      "🔮 *صبر کرو،* اچھے دن آنے والے ہیں! 🌈",
      "🔮 *تم بہت مضبوط ہو،* جو چاہو حاصل کر سکتے ہو! 💪",
      "🔮 *محبت تمہارے قریب ہے،* بس دیکھو! ❤️",
      "🔮 *آج کچھ نیا سیکھو،* یہ تمہارے کام آئے گا! 📚",
      "🔮 *جو تم چاہتے ہو وہی تمہیں ملے گا!* بس یقین رکھو! ✨",
      "🔮 *ایک پرانا دوست* تم سے رابطہ کرے گا! 🤝",
      "🔮 *تمہارا مستقبل روشن ہے،* بس آگے بڑھتے رہو! ☀️"
    ];

    let fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    let user = mek.sender ? `@${mek.sender.split("@")[0]}` : "دوست";

    let message = `━━━━━━━━━━━━━━━━━━━━\n🔮 *قسمت کی پیش گوئی* 🔮\n━━━━━━━━━━━━━━━━━━━━\n\n👤 *تمہارے لیے:* ${user}\n\n${fortune}\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: [mek.sender]
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *خرابی:* ${error.message}`);
  }
});

// ============================================
// 📌 MEME COMMAND - میم جنریٹر
// ============================================
cmd({
  pattern: "meme",
  alias: ["میم"],
  desc: "Generate random meme text",
  category: "fun",
  react: "😂",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const memes = [
      "😂 *جب کسی نے پیپر میں صرف اپنا نام لکھا اور پاس ہو گیا!* 📝",
      "😅 *مجھے لگا تھا کہ کل کا دن مشکل ہوگا، پر آج اور بھی مشکل نکلا!* 🤦",
      "🤣 *جب ماں نے پوچھا کہ کیا کھاؤ گے اور میں نے کہا 'جو بناؤ'* 🍽️",
      "😭 *جب میں نے سوچا کہ اب زندگی سمجھ آ گئی، پھر حساب کا پیپر آیا!* 📐",
      "😂 *میں: کل سے ڈائٹ شروع کروں گا*\nمیرا دماغ: چلو آج چکن کھا لیتے ہیں! 🍗",
      "😅 *جب کسی نے پوچھا کہ تمہارا پسندیدہ کھانا کیا ہے؟*\nمیں: جو میرے سامنے ہو! 🍕",
      "🤣 *سائنس: پانی ابلنے کا پوائنٹ 100°C ہے*\nپاکستانی ماں: بس ایک بار اور ابال لو! ☕",
      "😂 *میں صبح اٹھا: آج بہت کام کروں گا*\nمیرا بستر: نہیں تم نہیں کرو گے! 🛏️",
      "😭 *جب میں نے سوچا کہ وہ میری طرف دیکھ رہا ہے،*\nپتہ چلا وہ میرے پیچھے والے کو دیکھ رہا تھا! 👀"
    ];

    let meme = memes[Math.floor(Math.random() * memes.length)];
    
    let message = `━━━━━━━━━━━━━━━━━━━━\n😂 *میم ٹائم!* 😂\n━━━━━━━━━━━━━━━━━━━━\n\n${meme}\n\n> 🎭 *ہنسو اور ہنسانا جاری رکھو!*\n━━━━━━━━━━━━━━━━━━━━`;

    reply(message);

  } catch (error) {
    console.log(error);
    reply(`❌ *خرابی:* ${error.message}`);
  }
});

// ============================================
// 📌 RATE COMMAND - ریٹنگ
// ============================================
cmd({
  pattern: "rate",
  alias: ["ریٹ", "rating"],
  desc: "Rate someone or something",
  category: "fun",
  react: "⭐",
  filename: __filename,
  use: "@tag or reply to message"
}, async (conn, mek, m, { q, reply }) => {
  try {
    let targetUser = null;
    
    // Check if replying to a message
    if (mek.quoted && mek.quoted.sender) {
      targetUser = mek.quoted.sender;
    } 
    // Check if tagged user
    else if (m.mentionedJid && m.mentionedJid.length >= 1) {
      targetUser = m.mentionedJid[0];
    }

    let rating = Math.floor(Math.random() * 10) + 1;
    let stars = "⭐".repeat(rating) + "☆".repeat(10 - rating);
    
    let target = targetUser ? `@${targetUser.split("@")[0]}` : "آپ";

    let message = `━━━━━━━━━━━━━━━━━━━━\n⭐ *ریٹنگ کا وقت!* ⭐\n━━━━━━━━━━━━━━━━━━━━\n\n👤 *نام:* ${target}\n\n📊 *ریٹنگ:* ${rating}/10\n\n${stars}\n\n> 💫 *یہ ریٹنگ مکمل طور پر بے ترتیب ہے!*\n━━━━━━━━━━━━━━━━━━━━`;

    await conn.sendMessage(mek.chat, {
      text: message,
      mentions: targetUser ? [targetUser] : []
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ *خرابی:* ${error.message}`);
  }
});

// ============================================
// 📌 HELPER FUNCTIONS
// ============================================

function getMatchMessage(score) {
  if (score >= 950) return "💞 *آسمانی جوڑی!* کامل مطابقت! 🌟";
  if (score >= 850) return "💕 *شاندار مطابقت!* بہترین جوڑی! ✨";
  if (score >= 700) return "😊 *اچھی مطابقت!* ساتھ رہ سکتے ہو! 💑";
  if (score >= 500) return "🤔 *کوشش کرو!* ممکن ہے بن جائے! 💭";
  if (score >= 300) return "😅 *مشکل ہے!* پر محنت کرو! 💔";
  return "💔 *بہت کم مطابقت!* دوست رہو بہتر ہے! 🤝";
}

function getEmojiPair(score) {
  if (score >= 950) return "💞";
  if (score >= 850) return "💕";
  if (score >= 700) return "💗";
  if (score >= 500) return "💓";
  if (score >= 300) return "💔";
  return "💢";
}

function getAuraMessage(score) {
  if (score >= 950) return "👑 *لیجنڈری عارضہ!* ناقابلِ شکست! 🌟";
  if (score >= 850) return "⚡ *طاقتور عارضہ!* بہت مضبوط! 💫";
  if (score >= 700) return "💫 *اچھا عارضہ!* متاثر کن! ✨";
  if (score >= 500) return "🌙 *عام عارضہ!* ٹھیک ہے! ⭐";
  if (score >= 300) return "🌧️ *کمزور عارضہ!* بہتر کرو! 💪";
  return "💀 *بہت کمزور!* ابھی بہت کچھ سیکھنا ہے! 📚";
}

function getAuraEmoji(score) {
  if (score >= 950) return "👑";
  if (score >= 850) return "⚡";
  if (score >= 700) return "💫";
  if (score >= 500) return "🌙";
  if (score >= 300) return "🌧️";
  return "💀";
}

function getLoveMessage(percent) {
  if (percent >= 90) return "💖 *آسمانی محبت!* جنت میں بنی جوڑی! 🌟";
  if (percent >= 75) return "😍 *گہری محبت!* بہت مضبوط رشتہ! 💕";
  if (percent >= 60) return "😊 *اچھی محبت!* ساتھ رہ سکتے ہو! 💑";
  if (percent >= 40) return "🤔 *مشکل ہے!* پر کوشش کرو! 💭";
  if (percent >= 20) return "😅 *تھوڑی محبت!* دوست بنو بہتر ہے! 🤝";
  return "💔 *کوئی محبت نہیں!* الگ رہو بہتر ہے! 🚫";
}

function getLoveEmoji(percent) {
  if (percent >= 90) return "💖";
  if (percent >= 75) return "💕";
  if (percent >= 60) return "💗";
  if (percent >= 40) return "💓";
  if (percent >= 20) return "💔";
  return "💢";
}

console.log("✨ *تمام فن کمانڈز لوڈ ہو گئیں!* ✨");
