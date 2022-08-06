# Meta Parser Generator

```bash
npm install meta-parser-generator
```

Meta Parser Generator will help you generate an efficient parser using a grammar and a token definition.
Meta programming is used to generate a single self contained parser file.

The JavaScript call stack is used by those functoins within the parser. So if you design a very recursive inefficient grammar you might trigger a "Maximum call stack size exceeded" error for a large input.

This code has been extracted from https://github.com/batiste/blop-language

## Characteristics

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
    ['MATH', 'LINE*', 'EOS'], // EOS is the End Of Stream token, added automatically by the tokenizer
    // * is the repeating modifier {0,∞}. Better than recursion as it does not use the call stack
    ['LINE*', 'EOS'],
  ],
  'LINE': [
    ['newline', 'MATH'],
    ['newline'],
  ],
  'MATH': [
    // direct left recursion here
    ['MATH', 'math_operator', 'number'],
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

### AST interface

```typescript
interface ASTNode {
    children: [ASTNode]  // list of children ASTNode
    stream_index: number // position of the first token for this rule in the token stream
    type: str            // name of the rule
    subRule: number      // index of this grammar rule in the subrule array
    named: {}            // named elements
}
```

At the leaf of the AST you will find the final tokens. They have a slightly different interface

```typescript
interface Token {
    stream_index: number // position of the token in the token stream
    type: str            // name of token
    value: str           // the value of the token
    len: number          // shortcut for value.length
    lineStart: number    // line start position in the input
    columnStart: number  // column start position in the input
    start: number        // charater start position in the input 
}
```

### Errors

The util function `displayError` will display detailed informations about a tokenizer or parsing error. The most likely
parsing candidate hint is based on most token consumed.

<img src="/error.png" width="800">
