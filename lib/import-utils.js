/**
 * Callback function for sorting a list of card codes.
 * @param {String} code1
 * @param {String} code2
 * @return {Number}
 */
function sortCardCodes(code1, code2) {
    // the '00XXX' range of card codes is reserved for "variants", such as cards in Draft sets.
    // push them to the back of the list.
    if (code1.startsWith('00') && !code2.startsWith('00')) {
        return 1;
    } else if (!code1.startsWith('00') && code2.startsWith('00')) {
        return -1;
    }
    return parseInt(code1, 10) - parseInt(code2, 10);
}

module.exports = { sortCardCodes };