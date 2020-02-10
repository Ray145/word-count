'use strict';

const _ = require('lodash');

const proxyquire = require('proxyquire').noCallThru();
const assert = require('assert');
const sinon = require('sinon');

describe('services.WordCount', () => {

    let sandbox;

    let WordCountService;

    describe('- removeStringPunctuation', () => {
        beforeEach(() => {
            WordCountService = proxyquire('../../api/services/WordCount.js', {
                '../models': {}
            });
        });

        it('should remove punctuation from the passed in string', () => {
            const sutResult1 = WordCountService.removeStringPunctuation(
                'There .;%should be,./" no []-|punctuation'
            );
            assert.equal(sutResult1, 'There should be no punctuation');

            const sutResult2 = WordCountService.removeStringPunctuation(
                'More !?!?punctuation ;#[to be"(&% removed'
            );
            assert.equal(sutResult2, 'More punctuation to be removed');
        });
    });

    describe('- removeStringNumbers', () => {
        beforeEach(() => {
            WordCountService = proxyquire('../../api/services/WordCount.js', {
                '../models': {}
            });
        });

        it('should remove numbers from the passed in string', () => {
            const sutResult1 = WordCountService.removeStringNumbers(
                'There 5436should be1325 125no 6542numbers0'
            );
            assert.equal(sutResult1, 'There should be no numbers');

            const sutResult2 = WordCountService.removeStringNumbers(
                'More1 1355numbers42 9864to be9323 remo00ved'
            );
            assert.equal(sutResult2, 'More numbers to be removed');
        });
    });

    describe('- normalizeWhiteSpace', () => {
        beforeEach(() => {
            WordCountService = proxyquire('../../api/services/WordCount.js', {
                '../models': {}
            });
        });

        it('should normalize the white space of the passed in string', () => {
            const sutResult1 = WordCountService.normalizeWhiteSpace(
                'There \n should\t\t    be    \t\t\nno inconsistent     \n\nwhite           space'
            );
            assert.equal(sutResult1, 'There should be no inconsistent white space');

            const sutResult2 = WordCountService.normalizeWhiteSpace(
                'More    \t\t white   \n\tspace       to   be     \n\n\n\tnormalized'
            );
            assert.equal(sutResult2, 'More white space to be normalized');
        });
    });

    describe('- sortObject', () => {
        beforeEach(() => {
            WordCountService = proxyquire('../../api/services/WordCount.js', {
                '../models': {}
            });
        });

        it('should sort the object contents by key when key sortType is passed in', () => {
            const sutResult = WordCountService.sortObject({
                z: 1,
                b: 2,
                a: 1,
                y: 4
            }, 'key');

            assert.deepEqual(sutResult, {
                a: 1,
                b: 2,
                y: 4,
                z: 1
            });
        });
        it('should sort the object by values when different type of sortType is passed in', () => {
            const sutResult = WordCountService.sortObject({
                z: 1,
                b: 2,
                a: 9,
                y: 4
            }, 'value', 'desc');

            assert.deepEqual(sutResult, {
                a: 9,
                y: 4,
                b: 2,
                z: 1
            });
        });
    });

    describe('- sortResults', () => {
        let sortObjectStub;

        const mockResultsMap = 'some-results-map';

        beforeEach(() => {
            sandbox = sinon.createSandbox();

            WordCountService = proxyquire('../../api/services/WordCount.js', {
                '../models': {}
            });

            sortObjectStub = sandbox.stub(WordCountService, 'sortObject');
        });

        it('should call to sort object by key', () => {
            WordCountService.sortResults(mockResultsMap, 'key', 'asc');

            sinon.assert.calledOnce(sortObjectStub);
            sinon.assert.calledWithMatch(sortObjectStub,
                mockResultsMap, 'key', 'asc');
        });
        it('should call to sort object by value', () => {
            WordCountService.sortResults(mockResultsMap, 'occurences', 'desc');

            sinon.assert.calledOnce(sortObjectStub);
            sinon.assert.calledWithMatch(sortObjectStub,
                mockResultsMap, 'value', 'desc');
        });

        afterEach(() => sandbox.restore());
    });

    describe('- saveHistory', () => {
        let saveStub;

        const mockWordCount = {
            url: "/someUrl"
        };
        const mockWordOccurence = 'some-word-occurence';
        const mockDate = '2010-01-01 00:00:00';

        beforeEach(() => {
            sandbox = sinon.createSandbox();

            saveStub = sandbox.stub();
            WordCountService = proxyquire('../../api/services/WordCount.js', {
                '../models': {
                    WordCount: class Mock {
                        constructor(args) {
                            assert.deepEqual(args, _.assign(mockWordCount, {
                                date: mockDate,
                                wordCount: mockWordOccurence
                            }));
                        }

                        save = saveStub;
                    }
                }
            });
        });

        it('should create and save the word count record', async () => {
            await WordCountService.saveHistory(
                mockWordCount, mockWordOccurence, mockDate
            );

            sinon.assert.calledOnce(saveStub)
        });

        afterEach(() => sandbox.restore());
    });

    describe('- reduceToWordOccurence', () => {
        beforeEach(() => {
            WordCountService = proxyquire('../../api/services/WordCount.js', {
                '../models': {}
            });
        });

        it('should return a map of the word occurences', () => {
            let testString = `Tell the audience what you're going to say. Say it. Then tell them what you've said.`;

            testString = WordCountService.removeStringPunctuation(testString);

            const sutResult = WordCountService.reduceToWordOccurence(
                testString, {}
            );

            assert.deepEqual(sutResult, {
                "tell": 2,
                "the": 1,
                "audience": 1,
                "what": 2,
                "you're": 1,
                "going": 1,
                "to": 1,
                "say": 2,
                "it": 1,
                "then": 1,
                "them": 1,
                "you've": 1,
                "said": 1
            });
        });
    });

    describe('- processString', () => {
        let removeStringPunctuationStub;
        let removeStringNumbersStub;
        let normalizeWhiteSpaceStub;
        let reduceToWordOccurenceStub;

        const mockStringToProcess = 'some-string-to-process';

        beforeEach(() => {
            sandbox = sinon.createSandbox();

            WordCountService = proxyquire('../../api/services/WordCount.js', {
                '../models': {}
            });

            removeStringPunctuationStub = sandbox.stub(WordCountService, 'removeStringPunctuation')
                .returns(mockStringToProcess);
            removeStringNumbersStub = sandbox.stub(WordCountService, 'removeStringNumbers')
                .returns(mockStringToProcess);
            normalizeWhiteSpaceStub = sandbox.stub(WordCountService, 'normalizeWhiteSpace')
                .returns(mockStringToProcess);
            reduceToWordOccurenceStub = sandbox.stub(WordCountService, 'reduceToWordOccurence')
                .returns(mockStringToProcess);
        });

        it('should appropriatelly call to process the passed in string', async () => {

            WordCountService.processString(
                mockStringToProcess, { ignorePunctuation: true, ignoreNumbers: true }
            );

            sinon.assert.calledOnce(removeStringPunctuationStub);
            sinon.assert.calledWithMatch(removeStringPunctuationStub, mockStringToProcess);

            sinon.assert.calledOnce(removeStringNumbersStub);
            sinon.assert.calledWithMatch(removeStringNumbersStub, mockStringToProcess);

            sinon.assert.calledOnce(normalizeWhiteSpaceStub);
            sinon.assert.calledWithMatch(normalizeWhiteSpaceStub, mockStringToProcess);

            sinon.assert.calledOnce(reduceToWordOccurenceStub);
            sinon.assert.calledWithMatch(reduceToWordOccurenceStub, mockStringToProcess);
        });

        afterEach(() => sandbox.restore());
    });

    describe('- getWordOccurenceFromRequest', () => {
        let axiosGetStub;
        let processStringStub;

        const mockUrl = '/some-url';
        const mockOptions = 'some-options';
        const mockStringToProcess = 'sme-string-to-process';

        beforeEach(() => {
            sandbox = sinon.createSandbox();

            axiosGetStub = sandbox.stub().resolves({ data: mockStringToProcess });

            WordCountService = proxyquire('../../api/services/WordCount.js', {
                '../models': {},
                'axios': {
                    get: axiosGetStub
                }
            });

            processStringStub = sandbox.stub(WordCountService, 'processString');
        });

        it('should make the request and call for processing', async () => {

            await WordCountService.getWordOccurenceFromRequest(mockUrl, mockOptions);

            sinon.assert.calledOnce(axiosGetStub);
            sinon.assert.calledWithMatch(axiosGetStub, mockUrl);

            sinon.assert.calledOnce(processStringStub);
            sinon.assert.calledWithMatch(processStringStub, mockStringToProcess, mockOptions);
        });

        afterEach(() => sandbox.restore());
    });

    describe('- getWordCount', () => {
        let getWordOccurenceFromRequestStub;
        let saveHistoryStub;
        let sortResultsStub;

        const mockWordCountPayload = {
            url: '/some-url',
            options: {
                sort: 'mock-sort-prop',
                sortDirection: 'mock-sort-direction'
            }
        };
        const mockWordOccurence = 'mock-word-occurence';

        beforeEach(() => {
            sandbox = sinon.createSandbox();

            WordCountService = proxyquire('../../api/services/WordCount.js', {
                '../models': {}
            });

            getWordOccurenceFromRequestStub = sandbox.stub(WordCountService, 'getWordOccurenceFromRequest')
                .resolves(mockWordOccurence);
            saveHistoryStub = sandbox.stub(WordCountService, 'saveHistory');
            sortResultsStub = sandbox.stub(WordCountService, 'sortResults');
        });

        it('should to process the passed in url', async () => {

            await WordCountService.getWordCount(mockWordCountPayload);

            sinon.assert.calledOnce(getWordOccurenceFromRequestStub);
            sinon.assert.calledWithMatch(getWordOccurenceFromRequestStub,
                mockWordCountPayload.url, mockWordCountPayload.options);

            sinon.assert.calledOnce(saveHistoryStub);
            sinon.assert.calledWithMatch(saveHistoryStub, mockWordCountPayload, mockWordOccurence);

            sinon.assert.calledOnce(sortResultsStub);
            sinon.assert.calledWithMatch(sortResultsStub, mockWordOccurence,
                mockWordCountPayload.options.sort, mockWordCountPayload.options.sortDirection);
        });

        afterEach(() => sandbox.restore());
    });

});