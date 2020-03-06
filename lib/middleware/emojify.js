const descriptionSubstitutions = [
  // placeholder pattern, emoji name replacement, fallback markdown replacement
  [/\[baratheon\]/g, "mlbaratheon", "***Baratheon***"],
  [/\[greyjoy\]/g, "mlgreyjoy", "***Greyjoy***"],
  [/\[martell\]/g, "mlmartell", "***Martell***"],
  [/\[tyrell\]/g, "mltyrell", "***Tyrell***"],
  [/\[targaryen\]/g, "mltargaryen", "***Targaryen***"],
  [/\[thenightswatch\]/g, "mlthenightswatch", "***The Night's Watch***"],
  [/\[stark\]/g, "mlstark", "***Stark***"],
  [/\[neutral\]/g, "mlneutral", "***Neutral***"],
  [/\[lannister\]/g, "mllannister", "***Lannister***"],
  [/\[military\]/g, "mlmilitary", "***Military***"],
  [/\[intrigue\]/g, "mlintrigue", "***Intrigue***"],
  [/\[power\]/g, "mlpower", "***Power***"],
];

const titleSubstitutions = [
  [/\[unique\]/g, "mlunique", "+"],
];

function emojifyText(str, substitutions, client) {
  substitutions.forEach(searchReplace => {
    str = str.replace(searchReplace[0], match => {
      const emoji = client.emojis.find(emoji => emoji.name === searchReplace[1]);
      return emoji ? emoji.toString() : searchReplace[2];
    })
  });
  return str;
}

function emojify(client, embed) {
  if (embed.title) {
    embed.title = emojifyText(embed.title, titleSubstitutions, client);
  }
  if (embed.description) {
    embed.description = emojifyText(embed.description, descriptionSubstitutions, client);
  }
  return embed;
}

module.exports = emojify;
