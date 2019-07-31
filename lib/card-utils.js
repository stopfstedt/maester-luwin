// "Card Name (Pack Code)"
const RE_NAME_WITH_PACK_CODE = /^(.+)\((.+)\)$/;

/**
 * Transforms and returns a given card's name into an indexable key.
 * @param {String} name
 * @return {String}
 */
function makeKeyFromName(name) {
    return name.trim().replace(/^"(.+)"$/,'$1').toLowerCase();
}

/**
 * Transforms and returns a given card's pack code into an indexable key.
 * @param {String} code
 * @return {String}
 */
function makeKeyFromPackCode(code) {
    return code.trim().toLowerCase();
}

/**
 * Extracts the card's name and pack code from a given string.
 * @param {String} text
 * @return {Object|Boolean} An object holding the name and pack code, or FALSE if none could be found.
 */
function extractNameAndPackCode(text) {
    const matches = text.trim().match(RE_NAME_WITH_PACK_CODE);
    if (null === matches) {
        return false;
    }
    return {
        name: matches[1].trim(),
        packCode: matches[2].trim()
    }
}

module.exports = { makeKeyFromName, makeKeyFromPackCode, extractNameAndPackCode };