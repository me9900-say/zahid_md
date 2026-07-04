// lib/permissions.js
//
// Single source of truth for Owner detection and Group Admin detection.
//
// WHY THIS FILE EXISTS
// ---------------------
// Baileys v7 rolled out WhatsApp's "LID" (linked identity) addressing scheme.
// Depending on the account/group, a participant (including the bot's own
// account) can be represented by either:
//   - a phone-number JID:  923315462969@s.whatsapp.net
//   - a LID JID:           123456789012345@lid
// The old code compared raw strings (e.g. `groupAdmins.includes(botNumber2)`)
// assuming everything was always a phone-number JID. That assumption breaks
// as soon as WhatsApp hands back a LID for the bot or for the sender, which
// is exactly why the bot stopped recognizing its Owner and stopped
// recognizing that it is a Group Admin.
//
// This module normalizes every JID variant it encounters and always compares
// against the *set* of every known identifier for a given participant
// (id/jid/lid/phoneNumber), instead of a single assumed format.
//
// Everything in main.js and every plugin should use these helpers instead of
// re-deriving owner/admin logic locally.

const { jidNormalizedUser, jidDecode } = require('@whiskeysockets/baileys');
const config = require('../config');

/**
 * Normalize any JID-like string to `user@server` form, stripping the
 * `:device` suffix Baileys sometimes appends (e.g. `123:45@s.whatsapp.net`).
 */
function safeDecode(jid) {
    if (!jid || typeof jid !== 'string') return null;
    try {
        if (/:\d+@/.test(jid)) {
            const decoded = jidDecode(jid) || {};
            if (decoded.user && decoded.server) return `${decoded.user}@${decoded.server}`;
        }
        return jidNormalizedUser(jid) || jid;
    } catch (_) {
        return jid;
    }
}

/** Extract the bare user id/number portion of a JID (before the `@`). */
function bareNumber(jid) {
    const normalized = safeDecode(jid);
    if (!normalized) return null;
    return normalized.split('@')[0];
}

/**
 * Given an object and a list of keys that might hold a JID (e.g.
 * `id`, `jid`, `lid`, `phoneNumber`), return a Set containing the
 * normalized JID AND the bare number for every populated key.
 * This lets us compare "any known identifier" instead of one fixed field.
 */
function collectIdentifiers(obj, keys) {
    const set = new Set();
    if (!obj) return set;
    for (const key of keys) {
        const raw = obj[key];
        if (!raw || typeof raw !== 'string') continue;
        const normalized = safeDecode(raw);
        if (!normalized) continue;
        set.add(normalized);
        const bare = bareNumber(normalized);
        if (bare) set.add(bare);
    }
    return set;
}

/**
 * All known identifiers for the WhatsApp account currently connected to
 * this session (the bot itself), covering both PN and LID addressing.
 * `conn.user` shape varies slightly across Baileys versions/forks, so we
 * defensively check every field that could hold an identifier.
 */
function getBotIdentifiers(conn) {
    return collectIdentifiers(conn && conn.user, ['id', 'lid', 'jid']);
}

/**
 * Canonical Owner check.
 *
 * The connected account is ALWAYS the Owner — this is auto-detected from
 * the live session (`conn.user`) and never depends on manually configured
 * numbers, so it can't go stale.
 *
 * `config.OWNER_NUMBER` is kept only as an OPTIONAL allow-list for extra
 * co-owners; it is never required for the bot's own account to be
 * recognized as Owner.
 */
function isSenderOwner({ conn, mek, sender }) {
    // The bot sent this message itself (from its own linked WhatsApp app).
    if (mek && mek.key && mek.key.fromMe) return true;

    // Sender resolves to the same account currently connected to the
    // session, regardless of whether WhatsApp represented it as a
    // phone-number JID or a LID JID.
    const botIds = getBotIdentifiers(conn);
    const senderIds = collectIdentifiers({ jid: sender }, ['jid']);
    for (const id of senderIds) {
        if (botIds.has(id)) return true;
    }

    // Optional extra co-owners from config (never the primary mechanism).
    const extraOwners = Array.isArray(config.OWNER_NUMBER)
        ? config.OWNER_NUMBER.map((n) => String(n).replace(/[^0-9]/g, ''))
        : [];
    const senderBare = bareNumber(sender);
    if (senderBare && extraOwners.includes(senderBare)) return true;

    return false;
}

/**
 * Build an index (Set) of every identifier belonging to every admin in the
 * group, across all possible JID shapes Baileys may report per participant.
 */
function buildAdminIndex(participants) {
    const admins = new Set();
    for (const p of participants || []) {
        if (!p || (p.admin !== 'admin' && p.admin !== 'superadmin')) continue;
        for (const id of collectIdentifiers(p, ['id', 'jid', 'lid', 'phoneNumber'])) {
            admins.add(id);
        }
    }
    return admins;
}

/** Check whether ANY of the given JIDs match an entry in the admin index. */
function isInAdminIndex(adminIndex, ...jids) {
    for (const jid of jids) {
        for (const id of collectIdentifiers({ jid }, ['jid'])) {
            if (adminIndex.has(id)) return true;
        }
    }
    return false;
}

/**
 * One-call helper: given the socket + fresh group metadata + the message
 * sender, return everything a plugin needs to make permission decisions.
 * Replaces the old inline computation duplicated across main.js and
 * individual plugins (e.g. plugins/antilink.js's local isBotAdmin()).
 */
function getGroupPermissions({ conn, groupMetadata, sender }) {
    const participants = (groupMetadata && groupMetadata.participants) || [];
    const adminIndex = buildAdminIndex(participants);
    const botIdentifiers = Array.from(getBotIdentifiers(conn));

    return {
        groupAdmins: Array.from(adminIndex),
        isBotAdmins: isInAdminIndex(adminIndex, ...botIdentifiers),
        isAdmins: isInAdminIndex(adminIndex, sender),
    };
}

module.exports = {
    safeDecode,
    bareNumber,
    collectIdentifiers,
    getBotIdentifiers,
    isSenderOwner,
    buildAdminIndex,
    isInAdminIndex,
    getGroupPermissions,
};
