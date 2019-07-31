const request = require('request-promise-native');
const Discord = require('discord.js');
const Url = require('urijs');
var fs = require('fs');

const manamoji = require('./middleware/manamoji');
const utm = require('./middleware/utm');

const data = require("./../data/cards.json");
const { searchByName, searchByNameAndPack } = require("./search-utils.js");
const { makeKeyFromPackCode, makeKeyFromName, extractNameAndPackCode } = require("./card-utils.js");

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
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        resolveWithFullResponse: true,
        uri: this.makeUrl()
      }).then(response => {
        resolve(response);
      }).catch(err => {
        resolve(err.response);
      });
    });
  }

  makeEmbed(response) {
    //let parts = response.body.split('\n');
    //const embedTitle = parts.shift();
    console.log(response);
    return {
      title: response.label,
      description: response.text,
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

TextResponse.prototype.middleware = [manamoji, utm];
TextResponse.prototype.url = 'http://thronesdb.com/api/public/card/';

class ImageResponse extends TextResponse {
  makeEmbed(response) {
    //let parts = response.body.split('\n');
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
