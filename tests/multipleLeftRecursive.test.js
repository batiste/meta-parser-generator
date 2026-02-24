/**
 * Tests for grammar rules that have multiple left-recursive alternatives.
 *
 * Exercises the fix where memoize_left_recur must wrap the *combined* rule
 * function rather than each individual left-recursive alternative.
 *
 * Without the fix the short-circuit `||` chain in the combined function would
 * prevent the seed from ever growing when a non-LR alternative appears before
 * a LR one, and with two LR alternatives each would have its own isolated
 * grow-loop that cannot see progress made by the other alternative.
 */

import { generate } from '../dist/metaParserGenerator.js';

// ─── Grammar ────────────────────────────────────────────────────────────────
// START → exp EOS
// exp   → exp plus_op  exp    (LR alternative 1 – addition)
//       | exp times_op exp    (LR alternative 2 – multiplication)
//       | name                 (non-LR base case)
//
// Both LR alternatives come first so the combined function tries them before
// the base case.  The seed starts as failure, so on the first grow iteration
// both LR alternatives immediately return false, and the base case provides
// the initial seed.  Subsequent iterations extend through whichever LR path
// consumes the most input.
const grammar = {
  START: [
    ['exp', 'EOS'],
  ],
  exp: [
    ['exp', 'plus_op', 'exp'],   // LR 1
    ['exp', 'times_op', 'exp'],  // LR 2
    ['name'],                    // base
  ],
};

const tokensDefinition = {
  name:      { reg: /^[a-z]+/ },
  plus_op:   { str: '+' },
  times_op:  { str: '*' },
};

// ─── Build an in-memory parser from the grammar ───────────────────────────
function buildParser() {
  const codeLines = generate(grammar, tokensDefinition, false);
  const code = codeLines.join('\n');

  // The generated code ends with `export default { parse, tokenize };`.
  // Since new Function() runs in a plain function scope (not an ES module),
  // we strip that ESM footer and return the exports object directly instead.
  const exportStart = code.lastIndexOf('\nexport default {');
  const evalCode = code.slice(0, exportStart) + '\nreturn { parse, tokenize };';
  // eslint-disable-next-line no-new-func
  return new Function(evalCode)();
}

const parser = buildParser();

function parse(input) {
  const stream = parser.tokenize(tokensDefinition, input);
  return parser.parse(stream);
}

// ─── Tests ────────────────────────────────────────────────────────────────
describe('Multiple left-recursive alternatives', () => {
  describe('base case (non-LR alternative)', () => {
    test('single name parses correctly', () => {
      const result = parse('n');
      expect(result.success).toBe(true);
      expect(result.type).toBe('START');
    });
  });

  describe('single LR step', () => {
    test('a+b is parsed via plus_op alternative', () => {
      const result = parse('a+b');
      expect(result.success).toBe(true);
    });

    test('a*b is parsed via times_op alternative', () => {
      const result = parse('a*b');
      expect(result.success).toBe(true);
    });
  });

  describe('chained same-operator (growth through one LR alternative)', () => {
    test('a+b+c grows the seed twice via plus_op', () => {
      const result = parse('a+b+c');
      expect(result.success).toBe(true);
    });

    test('a*b*c grows the seed twice via times_op', () => {
      const result = parse('a*b*c');
      expect(result.success).toBe(true);
    });
  });

  describe('mixed operators (growth requires both LR alternatives)', () => {
    test('n+x+y – the motivating example from the bug report', () => {
      // Tokeniser uses only letters, so use "one" / "two" / "three" as tokens
      // to keep this distinct from the number-based existing tests.
      const result = parse('n+one+x');
      expect(result.success).toBe(true);
    });

    test('a+b*c uses both LR alternatives', () => {
      const result = parse('a+b*c');
      expect(result.success).toBe(true);
    });

    test('a*b+c uses both LR alternatives (different order)', () => {
      const result = parse('a*b+c');
      expect(result.success).toBe(true);
    });

    test('long mixed chain: a+b*c+d*e', () => {
      const result = parse('a+b*c+d*e');
      expect(result.success).toBe(true);
    });
  });

  describe('parse failures', () => {
    test('dangling operator fails', () => {
      const result = parse('a+');
      expect(result.success).toBe(false);
    });

    test('leading operator fails', () => {
      // '+' is a valid plus_op token so the tokeniser succeeds;
      // the parser fails because the stream starts with plus_op, not a name.
      const result = parse('+a');
      expect(result.success).toBe(false);
    });
  });

  describe('AST shape sanity', () => {
    test('a+b produces an exp node with three children (exp plus_op exp)', () => {
      const result = parse('a+b');
      expect(result.success).toBe(true);
      // result → START → exp (the grown result)
      const expNode = result.children[0];
      expect(expNode.type).toBe('exp');
      // Grown exp has children: left-exp, plus_op token, right-exp
      expect(expNode.children.length).toBe(3);
      expect(expNode.children[1].type).toBe('plus_op');
    });

    test('a+b+c produces a right-associative AST a+(b+c)', () => {
      // With exp → exp op exp, each right-side exp grows through its own
      // independent LR loop before the outer loop can incorporate it.
      // This makes the tree right-associative: a + (b + c).
      const result = parse('a+b+c');
      expect(result.success).toBe(true);
      const expNode = result.children[0]; // top exp: a+(b+c)
      expect(expNode.type).toBe('exp');
      expect(expNode.children.length).toBe(3); // left-exp  plus_op  right-exp
      // right child is the grown (b+c) sub-expression
      const rightExp = expNode.children[2];
      expect(rightExp.type).toBe('exp');
      expect(rightExp.children.length).toBe(3); // b  plus_op  c
    });
  });
});
