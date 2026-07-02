const { cmd } = require('../zaidi');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const FormData = require('form-data');
const { fileTypeFromBuffer } = require('file-type');

async function getMediaBuffer(msg, sock) {
    return await downloadMediaMessage(msg, 'buffer', {}, {
        logger: sock.logger,
        reuploadRequest: sock.updateMediaMessage
    });
}

function getQuotedMessage(message) {
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.quotedMessage) return null;
    return {
        key: {
            remoteJid: message.key.remoteJid,
            fromMe: false,
            id: ctx.stanzaId,
            participant: ctx.participant
        },
        message: ctx.quotedMessage
    };
}

cmd({
    pattern: "tourl",
    alias: ["mediaurl", "upload"],
    category: "converter",
    desc: "Upload media and get a URL.",
    usage: ".tourl (reply to media or send media with caption)"
}, async (conn, mek, m, { from }) => {
    try {
        let targetMsg = null;

        if (mek.message?.imageMessage ||
            mek.message?.videoMessage ||
            mek.message?.audioMessage ||
            mek.message?.stickerMessage ||
            mek.message?.documentMessage) {
            targetMsg = mek;
        }

        if (!targetMsg) {
            const quoted = getQuotedMessage(mek);
            if (quoted) targetMsg = quoted;
        }

        if (!targetMsg) {
            return await conn.sendMessage(from, {
                text: 'Reply to a media or send media with `.tourl`'
            }, { quoted: m });
        }

        const buffer = await getMediaBuffer(targetMsg, conn);
        if (!buffer) throw new Error('Failed to download media');

        if (buffer.length > 10 * 1024 * 1024) {
            return await conn.sendMessage(from, {
                text: '✴️ Media exceeds 10 MB limit.'
            }, { quoted: m });
        }

        const type = await fileTypeFromBuffer(buffer);
        if (!type) throw new Error('Could not detect file type');

        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, `upload.${type.ext}`);

        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });

        const url = res.data;
        if (typeof url !== 'string' || !url.startsWith('https://')) {
            throw new Error('Invalid upload URL');
        }

        const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
        await conn.sendMessage(from, {
            text: `✅ Upload Successful\n🔗 ${url}\n💾 ${sizeMB} MB`
        }, { quoted: m });

    } catch (e) {
        console.error('Catbox upload error:', e);
        await conn.sendMessage(from, {
            text: `❌ Upload failed: ${e.message}`
        }, { quoted: m });
    }
});
