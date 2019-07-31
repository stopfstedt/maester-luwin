const request = require('request-promise-native');
const Discord = require('discord.js');
const Url = require('urijs');
var fs = require('fs');

const cardList = require("../data/cardList.json");

const manamoji = require('./middleware/manamoji');
const utm = require('./middleware/utm');
const similarity = require('./card-similarity');
const { makeKeyFromPackCode, makeKeyFromName, extractNameAndPackCode } = require(__dirname + "/card-utils.js");

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
        const nameAndPackCode = extractNameAndPackCode(this.cardName);
        if (false === nameAndPackCode) {
          const key = makeKeyFromName(this.cardName);
          const names = Object.keys(cardList.cardsByName);
          if (names.includes(key)) {
            return resolve(cardList.cardsByName[key][0]);
          }
          let bestHit = 0;
          let bestCard;
          names.forEach(name => {
            const hit = similarity(key, name);
            if (0.45 <= hit && hit > bestHit) {
              bestHit = hit;
              bestCard = name;
            }
          });
          if (bestCard) {
            return resolve(cardList.cardsByName[bestCard][0]);
          }
        } else {
          const key = makeKeyFromName(nameAndPackCode.name);
          const code = makeKeyFromPackCode(nameAndPackCode.packCode);
          const codes = Object.keys(cardList.cardsBySet);
          if (codes.includes(code)) {
            let bestHit = 0;
            let bestCard;
            cardList.cardsBySet[code].forEach(card => {
              const name = makeKeyFromName(card.name);
              if (name === key) {
                return resolve(card);
              }
              const hit = similarity(this.cardName, makeKeyFromName(card.name));
              if (0.45 <= hit && hit > bestHit) {
                bestHit = hit;
                bestCard = card;
              }
            });
            if (bestCard) {
              return resolve(bestCard);
            }
          }
        }
        reject("Nothing Found");
      }catch(err) {
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
      });
    });
  }
}

TextResponse.prototype.middleware = [ manamoji, utm ];
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
