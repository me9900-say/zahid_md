// Jawad ZAIDI MD - KHAN XMD 
// Native Forward Command 
// Dont Remove Credit From File

const { cmd } = require("../zaidi");
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

cmd({
  pattern: "forward",
  alias: ["frd", "fwd"],
  desc: "Forward messages to groups using WhatsApp native method",
  category: "owner",
  filename: __filename
}, async (client, message, match, { isCreator }) => {
  try {
    // Owner check
    if (!isCreator) return await message.reply("*📛 Owner Only Command*");
    
    // Quoted message check
    if (!message.quoted) return await message.reply("*🍁 Please reply to a message to forward*");

    // Handle match input
    let jidInput = "";
    if (typeof match === "string") {
      jidInput = match.trim();
    } else if (Array.isArray(match)) {
      jidInput = match.join(" ").trim();
    } else if (match && typeof match === "object") {
      jidInput = match.text || "";
    }
    
    if (!jidInput) {
      return await message.reply(
        "*🍁 Usage:* `.forward jid1,jid2,...`\n" +
        "*Example:* `.forward 120363411055156472@g.us`\n" +
        "*Example (multiple):* `.forward 120363411055156472@g.us,1234567890@s.whatsapp.net`\n" +
        "Reply to a message first!"
      );
    }

    // Process JIDs - SUPPORT BOTH GROUP AND PERSONAL JIDs
    const rawJids = jidInput.split(',').map(jid => jid.trim()).filter(jid => jid);
    const validJids = rawJids
      .map(jid => {
        // Check if it's a complete JID with suffix
        if (jid.includes('@')) {
          // Already a proper JID
          if (jid.endsWith('@g.us') || jid.endsWith('@s.whatsapp.net')) {
            // Extract numbers from JID if needed
            const numbers = jid.match(/\d+/g);
            if (!numbers || numbers.length === 0) return null;
            
            if (jid.endsWith('@g.us')) {
              return `${numbers.join('')}@g.us`;
            } else {
              return `${numbers.join('')}@s.whatsapp.net`;
            }
          }
          return null;
        } 
        // If just numbers, assume it's a group JID
        else if (/^\d+$/.test(jid)) {
          return `${jid}@g.us`;
        }
        return null;
      })
      .filter(jid => jid !== null)
      .slice(0, 50); // Max 50 like other bot

    if (validJids.length === 0) {
      return await message.reply(
        "❌ No valid JIDs found\n" +
        "Provide JIDs like:\n" +
        "• `120363411055156472@g.us` (group)\n" +
        "• `1234567890@s.whatsapp.net` (personal)\n" +
        "• `120363411055156472@g.us,1234567890@s.whatsapp.net` (multiple)\n" +
        "• `120363411055156472` (numbers only = group)\n" +
        "Separate multiple with commas"
      );
    }

    // Remove duplicates
    const uniqueJids = [...new Set(validJids)];
    
    // Start processing
    await message.reply(`🔄 Forwarding to ${uniqueJids.length} chats...`);

    let successCount = 0;
    const failedJids = [];

    // Get the quoted message properly
    const quotedMsg = message.quoted;
    
    // Check if we have the proper message structure
    if (!quotedMsg.message && !quotedMsg.key) {
      // Try to create message structure if missing
      const messageType = quotedMsg.mtype;
      const messageContent = {};
      
      if (messageType && messageType.includes('Message')) {
        const typeKey = messageType.replace('Message', '');
        messageContent[typeKey.toLowerCase() + 'Message'] = quotedMsg;
      }
      
      quotedMsg.message = messageContent;
    }

    // Forward to each chat
    for (const [index, jid] of uniqueJids.entries()) {
      try {
        // Create the message to forward
        const forwardData = generateWAMessageFromContent(
          jid,
          quotedMsg.message || quotedMsg,
          { userJid: client.user.id }
        );

        // Send using relayMessage for native forwarding
        await client.relayMessage(jid, forwardData.message, {
          messageId: forwardData.key.id
        });

        successCount++;
        
        // Progress update every 5 chats
        if ((index + 1) % 5 === 0 && uniqueJids.length > 5) {
          await message.reply(`📤 Sent to ${index + 1}/${uniqueJids.length} chats...`);
        }
        
        // Small delay
        if (index < uniqueJids.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Forward error to ${jid}:`, error.message);
        failedJids.push({
          jid: jid.includes('@g.us') ? jid.replace('@g.us', '') : jid.replace('@s.whatsapp.net', ''),
          error: error.message.substring(0, 30)
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Final report
    let report = `✅ *Forward Complete*\n\n` +
                 `📤 Success: ${successCount}/${uniqueJids.length}\n`;
    
    if (quotedMsg.mtype) {
      const contentType = quotedMsg.mtype.replace('Message', '');
      report += `📦 Content Type: ${contentType}\n`;
    }
    
    // Count types
    const groupCount = uniqueJids.filter(jid => jid.endsWith('@g.us')).length;
    const personalCount = uniqueJids.filter(jid => jid.endsWith('@s.whatsapp.net')).length;
    report += `👥 Groups: ${groupCount}\n`;
    report += `👤 Personal: ${personalCount}\n`;
    
    if (failedJids.length > 0) {
      report += `\n❌ Failed (${failedJids.length}):\n`;
      failedJids.slice(0, 3).forEach(f => {
        report += `• ${f.jid}: ${f.error}\n`;
      });
      if (failedJids.length > 3) report += `... +${failedJids.length - 3} more`;
    }
    
    if (rawJids.length > uniqueJids.length) {
      report += `\n⚠️ Removed ${rawJids.length - uniqueJids.length} duplicate JIDs`;
    }
    
    if (rawJids.length > 50) {
      report += `\n⚠️ Limited to first 50 of ${rawJids.length} JIDs`;
    }

    await message.reply(report);

  } catch (error) {
    console.error("Forward Error:", error);
    await message.reply(
      `💢 Error: ${error.message.substring(0, 100)}\n\n` +
      `Try:\n1. Make sure bot is admin in target groups\n` +
      `2. Use recent messages (not too old)\n` +
      `3. Check JID format`
    );
  }
});
