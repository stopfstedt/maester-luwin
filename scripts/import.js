const fs = require('fs');
const path = require('path');
const https = require('https');
const { makeKeyFromPackCode, makeKeyFromName } = require("./../lib/card-utils.js");

const exportFile = path.join(__dirname, '../data/cardList.json');

const cardTextReplacement = [
  // House placeholders
  [/\[baratheon\]/g, "_Baratheon_"],
  [/\[greyjoy\]/g, "_Greyjoy_"],
  [/\[martell\]/g, "_Martell_"],
  [/\[tyrell\]/g, "_Tyrell_"],
  [/\[targaryen\]/g, "_Targaryen_"],
  [/\[thenightswatch\]/g, "_The Night's Watch_"],
  [/\[stark\]/g, "_Stark_"],
  [/\[lannister\]/g, "_Lannister_"],
  // Challenge Type placeholders
  [/\[military\]/g, "_Military_"],
  [/\[intrigue\]/g, "_Intrigue_"],
  [/\[power\]/g, "_Power_"],
  // Markup to Markdown
  [/<b>/g, "**"],
  [/<\/b>/g, "**"],
  [/<i>/g, "_"],
  [/<\/i>/g, "_"]
];

const cardFlavorTextReplacement = [
  [/<cite>/g, ""],
  [/<\/cite>/g, ""]
];

https.get('https://thronesdb.com/api/public/cards/', (res) => {

  const { statusCode } = res;
  const contentType = res.headers['content-type'];

  let error;
  if (statusCode !== 200) {
    error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
  } else if (!/^application\/json/.test(contentType)) {
    error = new Error('Invalid content-type.\n' +
    `Expected application/json but received ${contentType}`);
  }

  if (error) {
    console.error(error.message);
    res.resume();
    return;
  }

  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    let cards;
    try {
      cards = JSON.parse(rawData);
    } catch (e) {
      console.error(e.message);
    }

    // output data structure
    const data = {
      cards: {},
      indices: {
        packs: {},
        names: {}
      },
    }

    cards.forEach(card => {
      // massage card text and flavor-text.
      if (card.text) {
        cardTextReplacement.forEach(searchReplace => {
          card.text = card.text.replace(searchReplace[0], searchReplace[1]);
        });
      }
      if (card.flavor) {
        cardFlavorTextReplacement.forEach(searchReplace => {
          card.flavor = card.flavor.replace(searchReplace[0], searchReplace[1]);
        });
      }
      // store card by code.
      data.cards[card.code] = card;

      const packKey = makeKeyFromPackCode(card.pack_code);
      const nameKey = makeKeyFromName(card.name);

      // index cards by pack
      if (! data.indices.packs.hasOwnProperty(packKey)) {
        data.indices.packs[packKey] = {};
      }
      data.indices.packs[packKey][nameKey] = [ card.code ];

      // index cards by name
      if (! data.indices.names.hasOwnProperty(nameKey)) {
        data.indices.names[nameKey] = [];
      }
      data.indices.names[nameKey].push(card.code);
    });
    fs.writeFile(exportFile, JSON.stringify(data), 'utf8', (e) => {
      if (e) throw e;
    });
  });
}).on('error', (e) => {
  console.error(e);
});