const parser = require('./parser');
const { tokensDefinition } = require('./tokensDefinition');
const { grammar } = require('./grammar');
const { displayError } = require('../utils');

function parse(code) {
  const tokens = parser.tokenize(tokensDefinition, code);
  const ast = parser.parse(tokens);
  if (!ast.success && process.env.DEBUG) {
    displayError(tokens, tokensDefinition, grammar, ast);
  }
  return ast;
}

test('correct grammar', () => {
  const code = `9+9
1+1+2
`;
  const result = parse(code);
  expect(result.success).toBe(true);
});

test('incorrect', () => {
  const code = `9+9
1+1
1+2
1 + 4
`;
  const result = parse(code);
  expect(result.success).toBe(false);
});
