const { cmd } = require("../zaidi");

cmd({
  pattern: "getpp",
  alias: ["dlpp", "profilepic", "getdp"],
  react: "📸",
  desc: "Get user profile picture",
  category: "general",
  filename: __filename
}, async (client, mek, m, { from, reply, body, args, prefix, isGroup }) => {

  let target;
  let displayName = 'Unknown';
  let displayNumber = '';

  // 1. Check if replied to a message
  const quoted = m.message?.extendedTextMessage?.contextInfo;
  
  if (quoted?.mentionedJid?.[0]) {
    // 2. Check for Mention (@user)
    target = quoted.mentionedJid[0];
  } else if (quoted?.participant) {
    // Reply logic
    target = quoted.participant;
    if (quoted.pushName) displayName = quoted.pushName;
  } else if (args[0]) {
    // 3. Check for Number input
    const input = args[0].replace(/[^0-9]/g, '');
    if (input.length >= 10) {
      target = `${input}@s.whatsapp.net`;
      displayName = ''; // Will resolve name later if available
    } else {
      return reply(`❌ Invalid number format. Use: ${prefix}getpp 923051234567`);
    }
  } else {
    // Help message if no argument/reply found
    return reply(
      `📸 *Get Profile Picture*\n\n` +
      `Usage:\n` +
      `• Reply to someone's message and type: *${prefix}getpp*\n` +
      `• Mention someone: *${prefix}getpp @user*\n` +
      `• Provide a number: *${prefix}getpp 923001234567*`
    );
  }

  try {
    let realJid = target;

    // Handle LID (WhatsApp encrypted group IDs) fallback
    if (target.endsWith('@lid') && isGroup) {
      try {
        const metadata = await client.groupMetadata(from);
        const participant = metadata.participants.find((p) => p.lid === target || p.id === target);
        if (participant?.id) {
          realJid = participant.id;
        }
      } catch (err) {
        console.warn('Group metadata fetch failed for LID mapping:', err.message);
      }
    }

    const cleanNumber = realJid.replace(/@s\.whatsapp\.net|@lid/g, '').split(':')[0];
    displayNumber = cleanNumber.length >= 10 ? `+${cleanNumber}` : '';

    // Try resolving contact name via WhatsApp socket
    if (displayName === 'Unknown') {
      try {
        const name = await client.getName(realJid);
        if (name && !name.startsWith('+')) displayName = name;
      } catch (e) {
        // Fallback silently if name resolution fails
      }
    }

    let ppUrl = null;
    try {
      // Fetching profile picture URL directly
      ppUrl = await client.profilePictureUrl(realJid, 'image');
    } catch (e) {
      return reply(`❌ No profile picture found for *${displayName || displayNumber}*`);
    }

    if (ppUrl) {
      // Send the high quality DP image via direct URL handling
      await client.sendMessage(from, {
        image: { url: ppUrl },
        caption: `📸 *Profile Picture*${displayName && displayName !== 'Unknown' ? `\n\n👤 *Name:* ${displayName}` : ''}${displayNumber ? `\n📱 *Number:* ${displayNumber}` : ''}`
      }, { quoted: mek });
    }

  } catch (error) {
    console.error('GetPP Command Error:', error.message);
    reply(`❌ Failed to fetch profile picture: ${error.message}`);
  }
});

