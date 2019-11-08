
const { grammar } = require('./grammar');
const { tokensDefinition } = require('./tokensDefinition');
const { generateParser } = require('./metaParserGenerator');

generateParser(grammar, tokensDefinition, './parser.js');

console.log('parser generated')