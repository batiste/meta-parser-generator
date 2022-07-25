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

<img src="/error.png" width="800">
