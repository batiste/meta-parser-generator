const parser = require('./parser');
const { tokensDefinition } = require('./tokensDefinition');
const { grammar } = require('./grammar');
const { displayError } = require('../dist/utils');

function parse(code) {
  const tokens = parser.tokenize(tokensDefinition, code);
  const ast = parser.parse(tokens);
  if (!ast.success && process.env.DEBUG) {
    displayError(tokens, tokensDefinition, grammar, ast.primary_failure);
  }
  return ast;
}

describe('Parser Tests', () => {
  describe('Basic Parsing', () => {
    test('simple math expression', () => {
      const code = `9+9
1+1+2
`;
      const result = parse(code);
      expect(result.success).toBe(true);
      expect(result.type).toBe('START');
      expect(result.children).toBeDefined();
    });

    test('single number', () => {
      const code = '42\n';
      const result = parse(code);
      expect(result.success).toBe(true);
    });

    test('decimal numbers', () => {
      const code = '3.14+2.71\n';
      const result = parse(code);
      expect(result.success).toBe(true);
    });
  });

  describe('Error Detection', () => {
    test('missing operator', () => {
      const code = `9+9
1+1
1+2
1 + 4
`;
      const result = parse(code);
      expect(result.success).toBe(false);
      expect(result.primary_failure.token).toBeDefined();
    });

    test('unexpected character at start', () => {
      const code = '& invalid';
      expect(() => parser.tokenize(tokensDefinition, code)).toThrow(/Tokenizer error/);
    });

    test('incomplete expression', () => {
      const code = '5+\n';
      const result = parse(code);
      expect(result.success).toBe(false);
    });
  });

  describe('Left Recursion Support', () => {
    test('long chain of operations', () => {
      const code = '1+2+3+4+5+6+7+8+9+10\n';
      const result = parse(code);
      expect(result.success).toBe(true);
    });

    test('mixed operations', () => {
      const code = '10-5+3*2/4%2^3~1\n';
      const result = parse(code);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('empty lines', () => {
      const code = '\n\n5+5\n\n';
      const result = parse(code);
      expect(result.success).toBe(true);
    });

    test('only newlines', () => {
      const code = '\n\n\n';
      const result = parse(code);
      expect(result.success).toBe(true);
    });

    test('whitespace handling', () => {
      const code = '1   +   2\n';
      const result = parse(code);
      expect(result.success).toBe(false); // should fail as grammar doesn't allow spaces
    });
  });

  describe('Token Stream', () => {
    test('tokenizer produces correct tokens', () => {
      const code = '5+10\n';
      const tokens = parser.tokenize(tokensDefinition, code);
      
      expect(tokens.length).toBe(5); // number, operator, number, newline, EOS
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].value).toBe('5');
      expect(tokens[1].type).toBe('math_operator');
      expect(tokens[1].value).toBe('+');
      expect(tokens[2].type).toBe('number');
      expect(tokens[2].value).toBe('10');
      expect(tokens[3].type).toBe('newline');
      expect(tokens[4].type).toBe('EOS');
    });

    test('token positions are tracked', () => {
      const code = '123\n456\n';
      const tokens = parser.tokenize(tokensDefinition, code);
      
      const firstNum = tokens[0];
      expect(firstNum.line_start).toBe(0);
      expect(firstNum.column_start).toBe(0);
      expect(firstNum.start).toBe(0);
      
      const secondNum = tokens[2];
      expect(secondNum.line_start).toBe(1);
      expect(secondNum.column_start).toBe(0);
    });
  });

  describe('AST Structure', () => {
    test('AST has correct structure', () => {
      const code = '1+2\n';
      const result = parse(code);
      
      expect(result.success).toBe(true);
      expect(result.type).toBe('START');
      expect(result.stream_index).toBe(0);
      expect(result.children).toBeInstanceOf(Array);
      expect(result.named).toBeDefined();
    });

    test('nested rules in AST', () => {
      const code = '1+2+3\n';
      const result = parse(code);
      
      expect(result.success).toBe(true);
      // Should have nested structure due to left recursion
      const mathOp = result.children.find(child => child.type === 'GLOBAL_STATEMENT');
      expect(mathOp).toBeDefined();
    });
  });

  describe('Comments Support', () => {
    test('single line comment', () => {
      const code = '// this is a comment\n5+5\n';
      const tokens = parser.tokenize(tokensDefinition, code);
      expect(tokens[0].type).toBe('comment');
      expect(tokens[0].value).toBe('// this is a comment');
    });

    test('multiline comment', () => {
      const code = '/* multi\nline\ncomment */5+5\n';
      const tokens = parser.tokenize(tokensDefinition, code);
      expect(tokens[0].type).toBe('multiline_comment');
    });
  });

  describe('String Tokens', () => {
    test('double quoted string', () => {
      const tokens = parser.tokenize(tokensDefinition, '"hello world"');
      expect(tokens[0].type).toBe('str');
      expect(tokens[0].value).toBe('"hello world"');
    });

    test('single quoted string', () => {
      const tokens = parser.tokenize(tokensDefinition, "'hello'");
      expect(tokens[0].type).toBe('str');
      expect(tokens[0].value).toBe("'hello'");
    });

    test('string with escape', () => {
      const tokens = parser.tokenize(tokensDefinition, '"hello\\"world"');
      expect(tokens[0].type).toBe('str');
      expect(tokens[0].value).toBe('"hello\\"world"');
    });
  });

  describe('Multiple Statements', () => {
    test('multiple math operations', () => {
      const code = `1+2
3+4
5+6
`;
      const result = parse(code);
      expect(result.success).toBe(true);
    });

    test('first line without leading newline', () => {
      const code = `42+8
100
`;
      const result = parse(code);
      expect(result.success).toBe(true);
    });
  });
});
