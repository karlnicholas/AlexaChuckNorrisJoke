/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
const http = require('http');

const APP_ID = 'amzn1.ask.skill.aba2b488-abeb-4831-bd3d-3aee1247738d';
const SKILL_NAME = 'Chuck Norris Joke';
const HELP_MESSAGE = 'You can say tell me a Chuck Norris joke, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetJoke');
    },
    'GetNewJokeIntent': function () {
        this.emit('GetJoke');
    },
    'GetJoke': function () {
        http.get('http://api.icndb.com/jokes/random', (res) => {
          const statusCode = res.statusCode;
          const contentType = res.headers['content-type'];

          let error;
          if (statusCode !== 200) {
            error = new Error(`Request Failed.\n` +
                              `Status Code: ${statusCode}`);
          } else if (!/^application\/json/.test(contentType)) {
            error = new Error(`Invalid content-type.\n` +
                              `Expected application/json but received ${contentType}`);
          }
          if (error) {
            console.log(error.message);
            // consume response data to free up memory
            res.resume();
            return;
          }

          res.setEncoding('utf8');
          let rawData = '';
          res.on('data', (chunk) => rawData += chunk);
          res.on('end', () => {
            try {
              let joke = JSON.parse(rawData.replace(/&quot;/g,'"'));
              this.emit(':tellWithCard', joke.value.joke, SKILL_NAME, joke.value.joke);
            } catch (e) {
              console.log(e.message);
            }
          });
        }).on('error', (e) => {
          console.log(`Got error: ${e.message}`);
        });
        
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', HELP_MESSAGE, HELP_MESSAGE);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell',STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
