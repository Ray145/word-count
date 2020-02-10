'use strict';


const { WordCount } = require('../models');


module.exports = {
    getHistory
};


async function getHistory(req, res) {

    const sort = req.swagger.params.sort.value;
    let sortDirection = req.swagger.params.sortDirection.value;
    const includeWordCounts = req.swagger.params.includeWordCounts.value;

    sortDirection = (sortDirection && sortDirection.toLowerCase() === 'desc')
        ? -1
        : 1;

    let wordCounts;
    try {
        let query = WordCount.find();

        if (!includeWordCounts) {
            query = query.select(['-wordCount']);
        }
        if (sort) {
            query = query.sort({ date: sortDirection });
        }

        wordCounts = await query;
    } catch (err) {
        return res.status(500).json({
            success: false,
            err_message: err.message
        });
    }

    return res.json(wordCounts);
}