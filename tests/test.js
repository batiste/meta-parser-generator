const parser = require('./parser')
const { tokensDefinition } = require('./tokensDefinition')

function parse(code) {
  let tokens = parser.tokenize(tokensDefinition, code)
  const ast = parser.parse(tokens)
  return ast
}

test('correct grammar', () => {
  let code = `9+9
1+1+2
`  
  const result = parse(code)
  expect(result.success).toBe(true)
})

test('incorrect', () => {
  code = `9+9
1+1
1+2
1 + 4
`
  const result = parse(code)
  expect(result.success).toBe(false)
})

