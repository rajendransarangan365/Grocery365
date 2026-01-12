/**
 * Parses text to replace custom unicode escape sequences (e.g., U+1F601) with actual characters.
 * @param {string} text - The input text containing U+XXXX sequences.
 * @returns {string} - The parsed text with emojis/characters.
 */
export const parseMessageText = (text) => {
    if (!text) return '';
    const parsed = text.replace(/U\+([0-9A-Fa-f]+)/g, (match, hex) => {
        try {
            return String.fromCodePoint(parseInt(hex, 16));
        } catch (e) {
            return match; // Return original if invalid code point
        }
    });
    // Fallback: Remove any actual replacement characters that might have resulted from bad encoding previously
    return parsed.replace(/\uFFFD/g, '');
};
