const config = require('../config');

async function handleAntiLink(conn, message, from, isGroup, isAdmins, isBotAdmins) {
    try {
        if (!isGroup) return;
        if (!config.ANTI_LINK) return;
        if (isAdmins) return;
        
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || 
                    message.message?.imageMessage?.caption ||
                    message.message?.videoMessage?.caption || '';
        
        if (!text) return;
        
        const linkRegex = /(https?:\/\/[^\s]+)/gi;
        const matchedLinks = text.match(linkRegex);
        if (!matchedLinks) return;
        
        const allowedDomains = ['youtube.com', 'youtu.be', 'instagram.com', 'wa.me'];
        const isAllowed = matchedLinks.some(link => 
            allowedDomains.some(domain => link.includes(domain))
        );
        if (isAllowed) return;
        
        await conn.sendMessage(from, { delete: message.key });
        
        await conn.sendMessage(from, { 
            text: `⚠️ *Link Detected & Deleted!*\n@${message.key.participant?.split('@')[0] || 'Unknown'}`,
            mentions: [message.key.participant] 
        });
        
    } catch (error) {
        console.error('Anti-link error:', error);
    }
}

module.exports = { handleAntiLink };
