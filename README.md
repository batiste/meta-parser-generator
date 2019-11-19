# meta-parser-generator

Generate an efficient parser using a grammar and and token definition.
Meta programming is used to generate an efficient output.
The JavaScript native stack is used withing the parser.

This code has been extracted from https://github.com/batiste/blop-language

Characterisitcs

  * LL parser (Left to Right parser), arbitrary look ahead
  * Parser code is generated from a grammar
  * Decent error reporting on parsing error
  * Memoization
  * No left recursion (yet)
  * Small source code (~500 lines of code), no dependencies

<img src="/error.png" width="800">
