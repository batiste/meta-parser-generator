
import path from 'path';
import { fileURLToPath } from 'url';
import { grammar } from './grammar.js';
import { tokensDefinition } from './tokensDefinition.js';
import { generateParser } from '../dist/metaParserGenerator.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

generateParser(grammar, tokensDefinition, path.resolve(__dirname, './parser.js'));

console.log('parser generated');
