const descriptionSubstitutions = [
  // placeholder pattern, emoji name replacement, fallback markdown replacement
  [/\[baratheon\]/g, "baratheon", "***Baratheon***"],
  [/\[greyjoy\]/g, "greyjoy", "***Greyjoy***"],
  [/\[martell\]/g, "martell", "***Martell***"],
  [/\[tyrell\]/g, "tyrell", "***Tyrell***"],
  [/\[targaryen\]/g, "targaryen", "***Targaryen***"],
  [/\[thenightswatch\]/g, "thenightsmatch", "***The Night's Watch***"],
  [/\[stark\]/g, "stark", "***Stark***"],
  [/\[neutral\]/g, "neutra", "***Neutral***"],
  [/\[lannister\]/g, "lannister", "***Lannister***"],
  [/\[military\]/g, "military", "***Military***"],
  [/\[intrigue\]/g, "intrigue", "***Intrigue***"],
  [/\[power\]/g, "power", "***Power***"],
];

const titleSubstitutions = [
  [/\[unique\]/g, "unique", "+"],
];

function emojifyText(str, substitutions, client) {
  substitutions.forEach(searchReplace => {
    str = str.replace(searchReplace[0], match => {
      const emoji = client.emojis.find("name", searchReplace[1]);
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
