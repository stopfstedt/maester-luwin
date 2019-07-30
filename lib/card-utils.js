// "Card Title (Set Code)"
const RE_NAME_WITH_SET_CODE = /^(.+)\((.+)\)$/;

/**
 * Transforms and returns a given card's name into an indexable key.
 * @param {String} name 
 * @return {String}
 */
function makeKeyFromName(name) {
    return name.trim().replace(/^"(.+)"$/,'$1').toLowerCase();
}

/**
 * Transforms and returns a given card's Set code into an indexable key.
 * @param {String} code 
 * @return {String}
 */
function makeKeyFromSetCode(code) {
    return code.trim().toLowerCase();
}

/**
 * Extracts the card's name and set code from a given string.
 * @param {String} text 
 * @return {Object|Boolean} An object holding the name and code, or FALSE if none could be found.
 */
function extractNameAndSetCode(text) {
    const matches = text.trim().match(RE_NAME_WITH_SET_CODE);
    if (null === matches) {
        return false;
    }
    return {
        name: matches[1].trim(),
        code: matches[2].trim()
    }
}

module.exports = { makeKeyFromName, makeKeyFromSetCode, extractNameAndSetCode };