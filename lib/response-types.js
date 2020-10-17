const Url = require('urijs');
const axios = require('axios');

const data = require("./../data/cards.json");

const emojify = require('./middleware/emojify');
const utm = require('./middleware/utm');
const { searchByName, searchByNameAndPack } = require("./search-utils");
const { makeKeyFromPackCode, makeKeyFromName, extractNameAndPackCode } = require("./card-utils");
const getRenderer = require("./card-renderers");

class TextResponse {
  constructor(client, cardName) {
    this.client = client;
    this.cardName = cardName;
  }

  makeQuerystring() {
    return {
      fuzzy: this.cardName,
      format: 'text'
    };
  }

  makeUrl() {
    return Url(this.url).query(this.makeQuerystring()).toString();
  }

  makeRequest() {
    return axios.get(this.makeUrl());
  }

  makeEmbed(response) {
    const renderer = getRenderer(response);
    return {
      title: renderer.title,
      description: renderer.description,
      url: response.url,
      thumbnail: {
        url: response.image_url
      }
    };
  }

  lookupCard() {
    return new Promise((resolve, reject) => {
      try {
        let match;
        const nameAndPackCode = extractNameAndPackCode(this.cardName);

        if (false === nameAndPackCode) {
          match = searchByName(makeKeyFromName(this.cardName), data.indices.names, data.cards);
        } else {
          match = searchByNameAndPack(
            makeKeyFromName(nameAndPackCode.name),
            makeKeyFromPackCode(nameAndPackCode.packCode),
            data.indices.packs,
            data.cards
          );
        }
        if (match) {
          resolve(match);
        } else {
          reject(`Nothing search results found for "${this.cardName}".`);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  embed() {
    return new Promise((resolve, reject) => {
      this.lookupCard().then(response => {
        let embed = this.makeEmbed(response);
        this.middleware.length > 0 && this.middleware.forEach(mw => {
          embed = mw(this.client, embed);
        });
        resolve(embed);
      }).catch(err => {
        console.log(err);
      });
    });
  }
}

TextResponse.prototype.middleware = [emojify, utm];
TextResponse.prototype.url = 'http://thronesdb.com/api/public/card/';

class ImageResponse extends TextResponse {
  makeEmbed(response) {
    return {
      title: response.label,
      url: response.url,
      image: {
        url: response.image_url
      }
    };
  }
}

module.exports = { TextResponse, ImageResponse };
