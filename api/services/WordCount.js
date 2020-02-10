'use strict';

const axios = require('axios');
const _ = require('lodash');

const { WordCount } = require('../models');


module.exports = {
    getWordCount,

    //testing purposes
    streamWordOccurence,
    getWordOccurenceFromRequest,
    saveHistory,
    sortResults,
    processString,
    sortObject,
    reduceToWordOccurence,
    removeStringPunctuation,
    removeStringNumbers,
    normalizeWhiteSpace
};


async function getWordCount(wordCountPayload) {

    const { url, options } = wordCountPayload;
    const { processingType, sort, sortDirection } = options || {};

    let wordOccurence;
    try {
        switch (processingType) {
            case 'stream':
                wordOccurence = await module.exports.streamWordOccurence(url, options);
                break;

            default:
                wordOccurence = await module.exports.getWordOccurenceFromRequest(url, options);
                break;
        }

        await module.exports.saveHistory(wordCountPayload, wordOccurence, new Date());

    } catch (err) {
        throw err;
    }

    return module.exports.sortResults(wordOccurence, sort, sortDirection);
}

async function streamWordOccurence(url, options) {

    let urlPayload;
    try {
        urlPayload = await axios({ url, responseType: 'stream' });
    } catch (err) {
        throw err;
    }

    return new Promise((resolve, reject) => {

        let wordOccurence = {};

        urlPayload.data.on('data', (chunk) => {
            urlPayload.data.pause();

            let stringChunk = chunk.toString();

            wordOccurence = module.exports.processString(stringChunk, options, wordOccurence);

            urlPayload.data.resume();
        });

        urlPayload.data.on('end', () => resolve(wordOccurence));
        urlPayload.data.on('error', (err) => reject(err));
    });
}

async function getWordOccurenceFromRequest(url, options) {

    let urlPayload;
    try {
        urlPayload = await axios.get(url);
    } catch (err) {
        throw err;
    }

    return module.exports.processString(urlPayload.data, options);
}

function processString(stringToProcess, options, defaultMap) {

    const { ignorePunctuation, ignoreNumbers } = options;

    if (ignorePunctuation) {
        stringToProcess = module.exports.removeStringPunctuation(stringToProcess);
    }
    if (ignoreNumbers) {
        stringToProcess = module.exports.removeStringNumbers(stringToProcess);
    }
    stringToProcess = module.exports.normalizeWhiteSpace(stringToProcess);

    return module.exports.reduceToWordOccurence(stringToProcess, defaultMap || {});
}

function reduceToWordOccurence(stringToProcess, defaults) {
    return _.reduce(
        stringToProcess.split(' '),
        (acc, word) => {
            word = word.toLowerCase();

            if (!_.isEmpty(word) && word in acc) {
                acc[word] += 1;
            } else {
                acc[word] = 1;
            }

            return acc;
        },
        defaults
    );
}

function saveHistory(wordCountPayload, wordOccurence, date) {
    const wordCountInstance = new WordCount(
        _.assign(wordCountPayload, {
            date,
            wordCount: wordOccurence
        })
    );

    return wordCountInstance.save();
}

function sortResults(resultsMap, sort, sortDirection) {

    switch (sort) {
        case 'key':
            return module.exports.sortObject(resultsMap, 'key', sortDirection);

        case 'occurences':
            return module.exports.sortObject(resultsMap, 'value', sortDirection);

        default:
            return resultsMap;
    }
}

function sortObject(object, sortType, sortDirection) {
    let sortedPairs = _.sortBy(
        _.toPairs(object),
        sortType === 'key' ? 0 : 1
    );

    if (sortDirection && sortDirection.toLowerCase() === 'desc') {
        sortedPairs = sortedPairs.reverse();
    }

    return _.fromPairs(sortedPairs);
}

function removeStringPunctuation(inputString) {
    return inputString.replace(/[~`!@#$%^&*(){}\[\];:"<,.>?\/\\|_+=-]/gm, '');
}

function removeStringNumbers(inputString) {
    return inputString.replace(/\d+/gm, '');
}

function normalizeWhiteSpace(inputString) {
    return inputString.replace(/\s\s+|\n|\t/gm, ' ');
}