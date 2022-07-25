# Meta Parser Generator

```bash
npm install meta-parser-generator
```

Generate an efficient parser using a grammar and a token definition.
Meta programming is used to generate a single self contained output file container the whole parser.

The JavaScript call stack is used by those functoins within the parser. So if you design a very recursive inefficient grammar you might trigger a "Maximum call stack size exceeded" error for a large input.

This code has been extracted from https://github.com/batiste/blop-language

Characteristic

  * LL parser (Left to Right parser), arbitrary look ahead
  * Direct Left recursion support (no indirect)
  * Parser code is generated from a grammar
  * Good parsing performance
  * Decent error reporting on parsing error
  * Memoization
  * Small source code (~500 lines of code), no dependencies
  
## How to generate and use a parser

This will generate a mathematical operation parser
  
```javascript
const { generateParser } = require('meta-parser-generator');
const path = require('path');

// only 3 possible tokens
const tokensDefinition = {
  'number': { reg: /^[0-9]+(\.[0-9]*)?/ },
  'math_operator': { reg: /^(\+|-|\*|%)/ },
  'newline': { str: '\n' }
}

const grammar = {
  // keyword for the entry point of the grammar
  'START': [
    // necessary to accept the firt line to not be a newline
    ['GLOBAL_STATEMENT', 'GLOBAL_STATEMENTS*', 'EOS'], // EOS is the End Of Stream token, added automatically by the tokenizer
    ['GLOBAL_STATEMENTS*', 'EOS'],
  ],
  'GLOBAL_STATEMENTS': [
    ['newline', 'GLOBAL_STATEMENT'],
    ['newline'],
  ],
  'GLOBAL_STATEMENT': [
    ['math_operation'],
  ],
  'math_operation': [
    // direct left recursion here
    ['math_operation', 'math_operator', 'number'],
    ['number'],
  ],
};

// this generate the executable parser file
generateParser(grammar, tokensDefinition, path.resolve(__dirname, './parser.js'));
console.log('parser generated');
```

Then you can use the generated parser this way

```javascript
const parser = require('./parser');
const { tokensDefinition, grammar } = require('./generator');
const { displayError } = require('meta-parser-generator');

function parse(code) {
  const tokens = parser.tokenize(tokensDefinition, code);
  const ast = parser.parse(tokens);
  if (!ast.success) {
    displayError(tokens, tokensDefinition, grammar, ast);
  }
  return ast;
}

let ast = parse('9+10-190.3');
console.log(ast)
```

<img src="/error.png" width="800">
