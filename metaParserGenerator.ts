
import * as fs from 'fs';
import { preprocessGrammar, checkGrammarAndTokens } from './utils';
import { TokensDefinition, Grammar, ProcessedRule } from './types';


const recordFailure = `
let best_failure;
let best_failure_array = [];
let best_failure_index = 0;

// Records parsing failures at the deepest position reached
// Collects all failures at the same position to potentially show "expected: X, Y, or Z"
function record_failure(failure, i) {
  // New deepest position reached - reset tracking
  if (i > best_failure_index) {
    best_failure_array = [];
    best_failure = null;
    best_failure_index = i;
  }
  // Record this failure
  best_failure_array.push(failure);
  // Keep first failure as primary for error messages
  if (!best_failure) {
    best_failure = failure;
  }
}


// Memoization cache for regular rules
// Note: For very large inputs, this cache can grow to O(n * m) where:
// n = input size, m = number of grammar rules
// Cache is cleared between parse() calls to prevent memory leaks
let cache = {};

function memoize(name, func) {
  return function memoize_inner(stream, index) {
    const key = \`\${name}-\${index}\`;
    let value = cache[key];
    if (value !== undefined) {
      return value;
    }
    value = func(stream, index);
    cache[key] = value;
    return value;
  };
}

// Separate cache for left-recursive rules
let cacheR = {};

// based on https://medium.com/@gvanrossum_83706/left-recursive-peg-grammars-65dab3c580e1
function memoize_left_recur(name, func) {
  return function memoize_inner(stream, index) {
    const key = \`\${name}-\${index}\`;
    let value = cacheR[key];
    if (value !== undefined) {
      return value;
    }
    // prime this rule with a failure
    cacheR[key] = false;
    let lastpos;
    let lastvalue = value;
    while (true) {
      value = func(stream, index);
      if (!value) break;
      if (value.last_index <= lastpos) break;
      lastpos = value.last_index;
      lastvalue = value;
      cacheR[key] = value;
    }
    return lastvalue;
  };
}

`;

/**
 * Generates the tokenizer function code as an array of strings
 * @param tokenDef - Token definitions mapping token names to patterns
 * @returns Array of code lines for the tokenizer
 */
export function generateTokenizer(tokenDef: TokensDefinition): string[] {
  const output: string[] = [];
  const keys = Object.keys(tokenDef);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if ((/:|\?/g).test(key)) {
      throw new Error('Reserved word in token name');
    }
  }

  output.push('function _tokenize(tokenDef, input, char, stream) {');
  output.push('  let match;');
  let key;
  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    const token = tokenDef[key];
    if (token.str) {
      const strLen = token.str.length;
      if (token.str.indexOf("'") > -1 || token.str.indexOf('\n') > -1) {
        output.push(`  if (input.substr(char, ${strLen}) === \`${token.str}\`) {`);
        output.push(`    return [\`${token.str}\`, '${key}'];`);
      } else {
        output.push(`  if (input.substr(char, ${strLen}) === '${token.str}') {`);
        output.push(`    return ['${token.str}', '${key}'];`);
      }
      output.push('  }');
    } else if (token.reg) {
      output.push(`  match = input.substring(char).match(tokenDef.${key}.reg);`);
      output.push('  if (match !== null) {');
      output.push(`    return [match[0], '${key}'];`);
      output.push('  }');
    } else if (token.func) {
      output.push(`  match = tokenDef.${key}.func(input.substring(char), stream);`);
      output.push('  if (match !== undefined) {');
      output.push(`    return [match, '${key}'];`);
      output.push('  }');
    } else {
      throw new Error(`Tokenizer error: Invalid token ${key} without a reg, str or func property`);
    }
  }
  output.push(`  return [null, '${key}'];`);
  output.push('}');

  output.push('function tokenize(tokenDef, input) {');
  output.push(`  const stream = [];
  const originalInput = input;
  let lastToken;
  let key;
  let candidate = null;
  const len = input.length;
  let char = 0;
  let index = 0;
  let line = 0;
  let column = 0;
  while (char < len) {
    [candidate, key] = _tokenize(tokenDef, originalInput, char, stream);
    if (candidate !== null) {
      const candidateLen = candidate.length;
      lastToken = {
        type: key,
        value: candidate,
        start: char,
        stream_index: index,
        len: candidateLen,
        line_start: line,
        column_start: column,
      };
      // Only split if there might be newlines (optimization)
      if (candidate.indexOf('\\n') !== -1) {
        const lines = candidate.split('\\n');
        line += lines.length - 1;
        column = lines[lines.length - 1].length;
      } else {
        column += candidateLen;
      }
      lastToken.lineEnd = line;
      lastToken.columnEnd = column;
      stream.push(lastToken);
      index++;
      char += candidateLen;
    } else {
      if (stream.length === 0) {
        throw new Error('Tokenizer error: total match failure');
      }
      if (lastToken) {
        lastToken.pointer += lastToken.len;
      }
      let msg = \`Tokenizer error, no matching token found for \${originalInput.slice(char, char + 26)}\`;
      if (lastToken) {
        msg += \` After token of type \${lastToken.type}: \${lastToken.value}\`;
      }
      const error = new Error(msg);
      error.token = lastToken;
      throw error;
    }
  }
  stream.push({
    type: 'EOS', value: '<End Of Stream>', char, index,
  });
  return stream;
}
`);
  return output;
}

/**
 * Generates code for a specific grammar rule alternative
 * @param name - Name of the grammar rule
 * @param index - Index of this alternative in the rule
 * @param ruleItems - Array of rule items (tokens and sub-rules) in this alternative
 * @param tokensDef - Token definitions
 * @param debug - Whether to include debug logging
 * @returns Array of code lines for this rule function
 */
function generatesub_rule_index(
  name: string,
  index: number,
  ruleItems: ProcessedRule[],
  tokensDef: TokensDefinition,
  debug: boolean
): string[] {
  const output: string[] = [];
  output.push(`let ${name}_${index} = (stream, index) => {`);
  let i = 0;
  output.push('  let i = index;');
  output.push('  const children = [];');
  output.push('  const named = {};');
  output.push(`  const node = {
    children, stream_index: index, name: '${name}',
    sub_rule_index: ${index}, type: '${name}', named,
  };`);
  ruleItems.forEach((rule) => {
    // terminal rule
    if (tokensDef[rule.value] || rule.value === 'EOS') {
      debug ? output.push('  console.log(i, stream[i])') : null;
      if (rule.repeatable) {
        output.push(`  while(stream[i].type === '${rule.value}') {`);
        if (rule.alias) {
          output.push(`    named['${rule.alias}'] ? null : named['${rule.alias}'] = []`);
          output.push(`    named['${rule.alias}'].push(stream[i])`);
        }
        output.push('    children.push(stream[i]); i++;');
        output.push('  }');
      } else if (rule.optional) {
        output.push(`  if (stream[i].type === '${rule.value}') {`);
        rule.alias ? output.push(`    named['${rule.alias}'] = stream[i];`) : null;
        output.push('    children.push(stream[i]); i++;');
        output.push('  }');
      } else {
        output.push(`
  if (stream[i].type !== '${rule.value}') {
    if (i >= best_failure_index) {
      const failure = {
        type: '${name}', sub_rule_index: ${index},
        sub_rule_stream_index: i - index, sub_rule_token_index: ${i},
        stream_index: i, token: stream[i], first_token: stream[index], success: false,
      };
      record_failure(failure, i);
    }
    return false;
  }
`);
        rule.alias ? output.push(`  named['${rule.alias}'] = stream[i];`) : null;
        output.push('  children.push(stream[i]); i++;');
      }
      i++;
    // calling another rule in the grammar
    } else {
      if (rule.function) {
        output.push(`  if (!(${rule.value})(node)) { return false; }`);
      } else if (rule.repeatable) {
        output.push(`  let _rule_${i} = ${rule.value}(stream, i);`); // doing the call
        output.push(`  while (_rule_${i}) {`);
        if (rule.alias) {
          output.push(`    named['${rule.alias}'] ? null : named['${rule.alias}'] = [];`);
          output.push(`    named['${rule.alias}'].push(_rule_${i});`);
        }
        output.push(`    children.push(_rule_${i});`);
        output.push(`    i = _rule_${i}.last_index;`);
        output.push(`    _rule_${i} = ${rule.value}(stream, i);`);
        output.push('  }');
      } else if (!rule.optional) {
        output.push(`  const _rule_${i} = ${rule.value}(stream, i);`); // doing the call
        output.push(`  if (!_rule_${i}) return false;`);
        rule.alias ? output.push(`  named['${rule.alias}'] = _rule_${i};`) : null;
        output.push(`  children.push(_rule_${i});`);
        output.push(`  i = _rule_${i}.last_index;`);
      } else {
        output.push(`  const _rule_${i} = ${rule.value}(stream, i);`); // doing the call
        output.push(`  if (_rule_${i}) {`);
        output.push(`    children.push(_rule_${i});`);
        rule.alias ? output.push(`    named['${rule.alias}'] = _rule_${i};`) : null;
        output.push(`    i = _rule_${i}.last_index;`);
        output.push('  }');
      }
      i++;
    }
  });
  output.push('  node.success = i === stream.length; node.last_index = i;');
  output.push('  return node;');
  output.push('};');
  if (ruleItems[0].leftRecursion) {
    output.push(`${name}_${index} = memoize_left_recur('${name}_${index}', ${name}_${index});`);
  } else {
    output.push(`${name}_${index} = memoize('${name}_${index}', ${name}_${index});`);
  }
  output.push('\n');
  return output;
}

/**
 * Generates the complete parser code from grammar and token definitions
 * @param grammar - Grammar rules defining the language structure
 * @param tokensDef - Token definitions mapping token names to patterns
 * @param debug - Whether to include debug logging in generated code
 * @returns Array of code lines for the complete parser
 */
export function generate(grammar: Grammar, tokensDef: TokensDefinition, debug: boolean): string[] {
  let output: string[] = [];
  checkGrammarAndTokens(grammar, tokensDef);
  const newGrammar = preprocessGrammar(grammar);
  const entries = Object.keys(newGrammar);
  output.push('// This code is automatically generated by the meta parser, do not modify');
  output.push('// produced with metaParserGenerator.js');
  output.push(recordFailure);
  entries.forEach((key) => {
    let i = 0;
    const metaSub: string[] = [];
    newGrammar[key].forEach((ruleItems) => {
      output = output.concat(generatesub_rule_index(key, i, ruleItems, tokensDef, debug));
      metaSub.push(`${key}_${i}`);
      i++;
    });
    output.push(`function ${key}(stream, index) {`);
    const st = metaSub.map(sub => `${sub}(stream, index)`).join('\n    || ');
    output.push(`  return ${st};`);
    output.push('}');
  });
  output = output.concat(generateTokenizer(tokensDef));
  output.push(`module.exports = {
  parse: (stream) => {
    best_failure = null;
    best_failure_index = 0;
    best_failure_array = [];
    cache = {};
    cacheR = {};
    const result = START(stream, 0);
    if (!result) {
      return {
        success: false,
        primary_failure: best_failure,
        all_failures: best_failure_array,
      }
    }
    return result;
  },
  tokenize,
};
`);
  return output;
}

/**
 * Generates a parser file from grammar and token definitions
 * @param grammar - Grammar rules defining the language structure
 * @param tokensDefinition - Token definitions mapping token names to patterns
 * @param filename - Output path for the generated parser file
 */
export function generateParser(grammar: Grammar, tokensDefinition: TokensDefinition, filename: string): void {
  fs.writeFileSync(filename,
    generate(grammar, tokensDefinition, false).join('\n'));
}