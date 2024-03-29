
const path = require('path');
const { grammar } = require('./grammar');
const { tokensDefinition } = require('./tokensDefinition');
const { generateParser } = require('../dist/metaParserGenerator');

generateParser(grammar, tokensDefinition, path.resolve(__dirname, './parser.js'));

console.log('parser generated');
