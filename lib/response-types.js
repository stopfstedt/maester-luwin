const request = require('request-promise-native');
const Discord = require('discord.js');
const Url = require('urijs');
var fs = require('fs');

require.extensions['.txt'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

var cardList = require("../data/cardList.txt");

const manamoji = require('./middleware/manamoji');
const utm = require('./middleware/utm');
const similarity = require('./card-similarity');

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
        url: this.imageurl + response.imagesrc
      }
    };
  }

  lookupCard() {
    return new Promise((resolve, reject) => {
      try{
        //var cardList = require("../data/cardList.txt");
        var cardListEval = eval(cardList);
        //console.log(cardListEval);
        var i, len = cardListEval.length, stop = 1, out, bestCard,bestHit = 0;
        for (i = 0; i < len; i++) {
          var current = cardListEval[i];
          var hit = similarity(this.cardName,current.label);
          if(hit >= 0.45){
            if(bestHit === 0 || hit > bestHit){
              bestHit = hit;
              bestCard = current.label;
              out = current;
            }
          }
          //if (current.label.toLowerCase() === this.cardName.toLowerCase()) {
          //  console.log("here");
          //  out = cardListEval[i];
          //  stop = 0;
          //}
        }
        console.log("Best hit was: " + bestHit);
        console.log("Best card was: " + bestCard);
        if(bestHit > 0){
          resolve(out);
        }else{
          reject("Nothing Found");
        }
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
TextResponse.prototype.imageurl = 'http://thronesdb.com';


class ImageResponse extends TextResponse {
  makeEmbed(response) {
    //let parts = response.body.split('\n');
    return {
      title: response.label,
      url: response.url,
      image: {
        url: this.imageurl + response.imagesrc
      }
    };
  }
}


module.exports = { TextResponse, ImageResponse };
