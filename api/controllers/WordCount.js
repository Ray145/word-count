'use strict';


const WordCountService = require('../services/WordCount');


module.exports = {
    processWordCount
};


async function processWordCount(req, res) {

    const wordCountPayload = req.swagger.params.wordCountPayload.value;

    let wordCount;
    try {
        wordCount = await WordCountService.getWordCount(wordCountPayload);
    } catch (err) {
        return res.status(500).json({
            success: false,
            err_message: err.message
        });
    }

    return res.json(wordCount);
}