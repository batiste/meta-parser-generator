# meta-parser-generator

```bash
npm install meta-parser-generator
```

Generate an efficient parser using a grammar and and token definition.
Meta programming is used to generate an efficient parser using functions.

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
  
## Generate parser

This will generate a mathematical operation parser
  
```javascript
const { generateParser } = require('meta-parser-generator');
const path = require('path');

const tokensDefinition = {
  'number': { reg: /^[0-9]+(\.[0-9]*)?/ },
  'math_operator': { reg: /^(\+|-|\*|%)/ }
}

const grammar = {
  'START': [
    // necessary to accept the firt line to not be a newline
    ['GLOBAL_STATEMENT', 'GLOBAL_STATEMENTS*', 'EOS'],
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
    ['math_operation', 'math_operator', 'number'],
    ['number'],
  ],
};

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
  if (!ast.success && process.env.DEBUG) {
    displayError(tokens, tokensDefinition, grammar, ast);
  }
  return ast;
}

let ast = parse('9+10-190.3');
```

<img src="/error.png" width="800">
