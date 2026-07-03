
const { cmd } = require('../zaidi');
const axios = require('axios');
const { getBuffer } = require("../lib/functions");
const { videoToWebp } = require('../lib/video-utils');
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");

// Telegram Sticker API configuration
const stickerAPI = {
    baseURL: "https://jawad-tech.vercel.app/tgsticker"
};

cmd({
    pattern: "tsticker",
    alias: ["tg", "tgs", "tgstick", "telegramsticker"],
    react: "🛡️",
    desc: "Download Telegram sticker pack",
    category: "download",
    use: ".tsticker <telegram_sticker_url>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        await conn.sendMessage(from, {
            react: { text: "📦", key: m.key }
        });

        const url = args[0];

        if (!url) {
            const noUrlDisplay = `╭═══ 📦 TELEGRAM STICKER ═══⊷
┃❃╭──────────────
┃❃│ 🥺 No URL Provided
┃❃│ 💡 Use: .tsticker <telegram_url>
┃❃│ 📝 Example: .tsticker https://t.me/addstickers/packname
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

            await conn.sendMessage(from, { text: noUrlDisplay, quoted: mek });
            await conn.sendMessage(from, { react: { text: "⚠️", key: m.key } });
            return;
        }

        // Validate Telegram sticker URL
        if (!url.includes('t.me/addstickers/') && !url.includes('telegram.me/addstickers/')) {
            await reply("❌ *Please provide a valid Telegram sticker pack URL!*");
            await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
            return;
        }

        const loadingDisplay = `╭═══ 📦 TELEGRAM STICKER ═══⊷
┃❃╭──────────────
┃❃│ ⏳ Fetching pack data...
┃❃│ 📦 Please wait a moment!
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, { text: loadingDisplay, quoted: mek });

        // Get sticker pack data from API
        const apiUrl = `${stickerAPI.baseURL}?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'accept': '*/*'
            }
        });

        if (!res.data || !res.data.status || !res.data.result || !res.data.result.stickers) {
            return await reply("❌ *Failed to fetch sticker pack. Invalid URL or API error.*");
        }

        const stickerData = res.data.result;
        const stickers = stickerData.stickers;

        if (!stickers || stickers.length === 0) {
            return await reply("❌ *No stickers found in this pack!*");
        }

        // Send sticker pack info
        const infoDisplay = `╭═══ 📦 PACK DETAILS ═══⊷
┃❃╭──────────────
┃❃│ 📝 Name: ${stickerData.name || 'N/A'}
┃❃│ 👑 Title: ${stickerData.title || 'N/A'}
┃❃│ 🏷️ Type: ${stickerData.sticker_type || 'regular'}
┃❃│ 📊 Total Stickers: ${stickers.length}
┃❃│ ⏳ Status: Sending stickers live...
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await conn.sendMessage(from, { text: infoDisplay, quoted: mek });

        let sentCount = 0;
        let failedCount = 0;
        const totalStickers = stickers.length;
        let pack = "𓆩 ＳＩＬＶＥＲ 𓆪 ⿻⃮͛ 🏴‍☠️💀";

        // Send each sticker live as it downloads
        for (const [index, sticker] of stickers.entries()) {
            try {
                const stickerUrl = sticker.image_url;
                const fileExtension = stickerUrl.split('.').pop().toLowerCase();
                
                if (fileExtension === 'webp') {
                    // Static WebP sticker - sent instantly
                    await conn.sendMessage(from, {
                        sticker: { url: stickerUrl }
                    }, { quoted: mek });
                    
                } else if (fileExtension === 'tgs' || fileExtension === 'webm') {
                    // Animated sticker conversion
                    try {
                        const videoBuffer = await getBuffer(stickerUrl);
                        const webpBuffer = await videoToWebp(videoBuffer);
                        
                        let stickerObj = new Sticker(webpBuffer, {
                            pack: pack, 
                            type: StickerTypes.FULL,
                            categories: ["🤩", "🎉"], 
                            id: "12345",
                            quality: 75, 
                            background: 'transparent',
                        });
                        
                        const buffer = await stickerObj.toBuffer();
                        await conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
                        
                    } catch (convertError) {
                        console.error(`Conversion failed for sticker ${index + 1}:`, convertError.message);
                        // Fallback as document
                        await conn.sendMessage(from, {
                            document: { url: stickerUrl },
                            fileName: `sticker_${index + 1}.${fileExtension}`,
                            mimetype: 'application/octet-stream'
                        }, { quoted: mek });
                    }
                    
                } else {
                    // Other formats fallback
                    try {
                        await conn.sendMessage(from, { image: { url: stickerUrl } }, { quoted: mek });
                    } catch (imageError) {
                        await conn.sendMessage(from, {
                            document: { url: stickerUrl },
                            fileName: `sticker_${index + 1}.${fileExtension}`,
                            mimetype: 'application/octet-stream'
                        }, { quoted: mek });
                    }
                }
                
                sentCount++;
                // 1.5-second delay to avoid spam/crash
                await new Promise(resolve => setTimeout(resolve, 1500));
                
            } catch (stickerError) {
                console.error(`Error sending sticker ${index + 1}:`, stickerError.message);
                failedCount++;
            }
        }

        // Success final response
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
        
        const finalDisplay = `╭═══ ✅ DOWNLOAD COMPLETE ═══⊷
┃❃╭──────────────
┃❃│ 🎉 Pack Processed!
┃❃│ 📥 Success: ${sentCount}/${totalStickers}
┃❃│ ❌ Failed: ${failedCount}
┃❃╰───────────────
╰═════════════════⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪`;

        await reply(finalDisplay);

    } catch (error) {
        console.error('TGSTICKER ERROR:', error);
        await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
        await reply("❌ *Telegram sticker download me error aya!*");
    }
});
