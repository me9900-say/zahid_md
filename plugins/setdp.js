const { cmd } = require('../zaidi');
const { getBuffer } = require('../lib/functions');

// Sharp library optional hai, agar nahi hai to fallback use karega
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.log('⚠️ Sharp not installed, using fallback mode');
    sharp = null;
}

cmd({
    pattern: "setdp",
    alias: ["setpp", "profilepic"],
    desc: "Apni profile picture change karein (Full image without crop)",
    category: "profile",
    react: "🖼️"
}, async (conn, mek, m, { args, reply, sender, isReply }) => {
    let mediaBuffer = null;

    // ✅ 1. Agar command khud image ke caption mein hai (self-image)
    if (m.mimetype && m.mimetype.startsWith('image/')) {
        try {
            const stream = await conn.downloadContentFromMessage(m, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaBuffer = buffer;
        } catch (e) {
            return reply("❌ *Image download nahi ho saki.*");
        }
    }
    // ✅ 2. Agar kisi image ko reply kiya hai
    else if (m.quoted && m.quoted.mimetype && m.quoted.mimetype.startsWith('image/')) {
        try {
            const stream = await conn.downloadContentFromMessage(m.quoted, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaBuffer = buffer;
        } catch (e) {
            return reply("❌ *Image download nahi ho saki.*");
        }
    }
    // ✅ 3. Agar URL diya hai
    else if (args[0] && args[0].match(/https?:\/\/.+/)) {
        try {
            mediaBuffer = await getBuffer(args[0]);
        } catch (e) {
            return reply("❌ *URL se image nahi mili.*");
        }
    }

    if (!mediaBuffer) {
        return reply("❌ *Koi image do!*\n\n📸 *Tarike:*\n1. Image reply karein: `.setdp`\n2. Image caption mein likhein: `.setdp`\n3. URL dein: `.setdp https://example.com/image.jpg`");
    }

    try {
        // 🖼️ Process image to avoid cropping (agar sharp available hai)
        let finalBuffer = mediaBuffer;
        
        if (sharp) {
            try {
                finalBuffer = await processProfileImage(mediaBuffer);
            } catch (processError) {
                console.warn('⚠️ Image processing failed, using original:', processError.message);
                finalBuffer = mediaBuffer;
            }
        } else {
            // Sharp nahi hai to original use karein
            console.log('ℹ️ Using original image (sharp not installed)');
        }

        // 🔄 Update profile picture
        await conn.updateProfilePicture(sender, finalBuffer);
        
        const msg = sharp ? 
            "✅ *Profile picture update ho gayi!*\n📸 *Full image - No crop*" :
            "✅ *Profile picture update ho gayi!*\n⚠️ *Sharp install nahi hai, image crop ho sakti hai*";
        
        reply(msg);
        
    } catch (e) {
        console.error('❌ SetDP Error:', e);
        
        // Fallback: agar processed image fail ho to original try karein
        if (e.message && e.message.includes('image') && mediaBuffer) {
            try {
                await conn.updateProfilePicture(sender, mediaBuffer);
                return reply("✅ *Profile picture update ho gayi!*\n⚠️ *Original image use hui (crop ho sakti hai)*");
            } catch (fallbackError) {
                console.error('❌ Fallback Error:', fallbackError);
            }
        }
        
        reply("❌ *DP update nahi ho saki.*\nError: " + e.message);
    }
});

// 🖼️ Image Processing Function - No Crop, Full Image
async function processProfileImage(imageBuffer) {
    if (!sharp) {
        throw new Error('Sharp library not installed');
    }
    
    try {
        // Get image metadata
        const metadata = await sharp(imageBuffer).metadata();
        const { width, height } = metadata;
        
        const TARGET_SIZE = 640; // WhatsApp DP optimal size
        
        // If already square, just resize
        if (width === height) {
            return await sharp(imageBuffer)
                .resize(TARGET_SIZE, TARGET_SIZE, {
                    fit: 'fill',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 90 })
                .toBuffer();
        }
        
        // Create square canvas with white background
        let resizedImage;
        if (width > height) {
            // Landscape
            resizedImage = await sharp(imageBuffer)
                .resize(TARGET_SIZE, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toBuffer();
        } else {
            // Portrait
            resizedImage = await sharp(imageBuffer)
                .resize(null, TARGET_SIZE, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toBuffer();
        }
        
        // Get resized dimensions for centering
        const resizedMetadata = await sharp(resizedImage).metadata();
        const left = Math.floor((TARGET_SIZE - resizedMetadata.width) / 2);
        const top = Math.floor((TARGET_SIZE - resizedMetadata.height) / 2);
        
        // Create canvas with white background and composite image
        const processedBuffer = await sharp({
            create: {
                width: TARGET_SIZE,
                height: TARGET_SIZE,
                channels: 3,
                background: { r: 255, g: 255, b: 255 } // White background
            }
        })
        .composite([{
            input: resizedImage,
            left: left,
            top: top
        }])
        .jpeg({ quality: 85 })
        .toBuffer();
        
        return processedBuffer;
        
    } catch (error) {
        console.error('❌ Process Error:', error);
        throw error;
    }
}
