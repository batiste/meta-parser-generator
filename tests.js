const parser = require('./parser')
const { tokensDefinition } = require('./tokensDefinition')
const { displayError } = require('./utils')
const { grammar } = require('./grammar')

function parse(code) {
  let tokens = parser.tokenize(tokensDefinition, code)
  const ast = parser.parse(tokens)
  if(!ast.success) {
    displayError(tokens, tokensDefinition, grammar, ast)
  }
  return ast
}

let code = `9+9
1+1+2
`

parse(code)

code = `9+9
1+1
1+2
1 + 4
`

parse(code)

