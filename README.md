# meta-parser-generator

Generate an efficient parser using a grammar and and token definition.
Meta programming is used to generate an efficient output.
The JavaScript native stack is used withing the parser.

This code has been extracted from https://github.com/batiste/blop-language

Characterisitcs

  * Left to Right parser, one token look ahead
  * Memoization
  * Parser code is generated from a grammar
  * Decent error reporting on parsing error
  * No left recursion

<img src="/error.png" width="400">
