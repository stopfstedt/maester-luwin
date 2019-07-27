const fs = require('fs');
const path = require('path');
const https = require('https');

const exportFile = path.join(__dirname, '../data/cardList.txt');

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
    cards.forEach(card => {
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
    });
    fs.writeFile(exportFile, JSON.stringify(cards), 'utf8', (e) => {
      if (e) throw e;
    });
  });
}).on('error', (e) => {
  console.error(e);
});