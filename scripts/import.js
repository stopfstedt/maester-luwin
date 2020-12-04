const fs = require('fs');
const path = require('path');
const https = require('https');
const { makeKeyFromPackCode, makeKeyFromName } = require("./../lib/card-utils.js");
const { sortCardCodes } = require("./../lib/import-utils.js");

const exportFile = path.join(__dirname, '../data/cards.json');

const cardTextReplacement = [
  // Markup to Markdown
  [/<b>/g, "**"],
  [/<\/b>/g, "**"],
  [/<i>/g, "***"],
  [/<\/i>/g, "***"],
  [/<em>/g, "_"],
  [/<\/em>/g, "_"],
  // Line Breaks to double line breaks, otherwise markdown will just eat the break.
  [/\n/g, '\n\n']
];

const cardFlavorTextReplacement = [
  [/<cite>/g, "– "],
  [/<\/cite>/g, ""]
];

https.get('https://redesigns.thronesdb.com/api/public/cards/', (res) => {

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
      if (! ['FH', 'R', 'JS'].includes(card.pack_code)) {
        card.url = card.url.replace('redesigns.', '');
        if (card.image_url) {
          card.image_url = card.image_url.replace('redesigns.', '');
        }
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

    // make another pass over the names index, and sort the card codes for each title entry.
    const names = Object.keys(data.indices.names);
    names.forEach(name => {
      data.indices.names[name].sort(sortCardCodes);
    })
    fs.writeFile(exportFile, JSON.stringify(data), 'utf8', (e) => {
      if (e) throw e;
    });
  });
}).on('error', (e) => {
  console.error(e);
});
