const { cmd } = require('../zaidi');

cmd({
    pattern: "setname",
    alias: ["name"],
    desc: "Apna display name change karein. Usage: .setname <new name>",
    category: "profile",
    react: "✏️"
}, async (conn, mek, m, { args, reply, sender }) => {
    const newName = args.join(' ');
    if (!newName) return reply("❌ *Naya name likhiye!*\nExample: .setname Ali");
    
    try {
        await conn.updateProfileName(newName);
        reply(`✅ *Display name update ho gaya!*\nNaya naam: *${newName}*`);
    } catch (e) {
        console.error(e);
        reply("❌ *Name update nahi ho saka. Kuch masla hai.*");
    }
});


const { cmd } = require('../zaidi');

cmd({
    pattern: "setbio",
    alias: ["bio", "about"],
    desc: "Apni bio (about) change karein. Usage: .setbio <new bio>",
    category: "profile",
    react: "📝"
}, async (conn, mek, m, { args, reply, sender }) => {
    const newBio = args.join(' ');
    if (!newBio) return reply("❌ *Nayi bio likhiye!*\nExample: .setbio I love coding");
    
    try {
        await conn.updateProfileStatus(newBio);
        reply(`✅ *Bio update ho gayi!*\nNayi bio: *${newBio}*`);
    } catch (e) {
        console.error(e);
        reply("❌ *Bio update nahi ho saki. Kuch masla hai.*");
    }
});
