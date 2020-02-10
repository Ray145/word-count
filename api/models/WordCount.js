'use strict';

const Schema = require('mongoose').Schema;

module.exports = new Schema({
    url: String,
    date: Date,
    wordCount: Object,
    options: {
        processingType: String,
        sort: String,
        sortDirection: String,
        ignorePunctuation: Boolean,
        ignoreNumbers: Boolean
    }
});