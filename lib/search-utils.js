const SIMILARY_THRESHOLD = 0.45;

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
      costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
          newValue = Math.min(Math.min(newValue, lastValue),
          costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
    costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * Searches the given index for the given key, and returns the best match from the given cards data.
 * @param {String} key The name-based key of the card to search for.
 * @param {Object} index The index to search.
 * @param {Object} cards The cards data, keyed off by card code.
 * @return {Object|Boolean} The best matching card, or FALSE if none could be found.
 */
function searchByName(key, index, cards) {
  const names = Object.keys(index);

  if (names.includes(key)) {
    return cards[index[key][0]];
  }

  let bestHit = 0;
  let bestName;
  names.forEach(name => {
    const hit = similarity(key, name);
    if (SIMILARY_THRESHOLD <= hit && hit > bestHit) {
      bestHit = hit;
      bestName = name;
    }
  });
  if (bestName) {
    return cards[index[bestName][0]];
  }

  return false;
}

/**
 * Searches the given index for the given name- and pack-key, and returns the best match from the given cards data.
 * @param {String} nameKey The name-based key of the card to search for.
 * @param {String} packKey The pack-based key of the card to search for.
 * @param {Object} index The index to search.
 * @param {Object} cards The cards data, keyed off by card code.
 * @return {Object|Boolean} The best matching card, or FALSE if none could be found.
 */
function searchByNameAndPack(nameKey, packKey, index, cards) {
  const packCodes = Object.keys(index);
  if (packCodes.includes(packKey)) {
    return searchByName(nameKey, index[packKey], cards);
  }
  return false;
}

module.exports = { searchByName, searchByNameAndPack };
