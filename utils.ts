import { ASTNode, RuleNode, Token } from "./types";

const RED = '\x1B[0;31m';
const YELLOW = '\x1B[1;33m';
const NC = '\x1B[0m';

function replaceInvisibleChars(v) {
  v = v.replace(/\r/g, '⏎\r');
  v = v.replace(/\n/g, '⏎\n');
  v = v.replace(/\t/g, '⇥');
  v = v.replace('\xa0', 'nbsp');
  return v.replace(/[ ]/g, '␣');
}

function tokenPosition(token: Token) {
  const lineNumber = token.line_start;
  const charNumber = token.column_start;
  const end = charNumber + token.len;
  return { lineNumber, charNumber, end };
}

function streamContext(token: Token, firstToken: Token, stream: [Token]) {
  const index = token.stream_index;
  const firstTokenIndex = firstToken.stream_index;
  const { lineNumber } = tokenPosition(token);

  let lineNb = 1;
  let streamIndex = 0;
  let str = NC;

  function char(v) {
    if (streamIndex === index) {
      return RED + replaceInvisibleChars(v) + NC;
    }
    if (streamIndex >= firstTokenIndex && streamIndex < index) {
      return YELLOW + replaceInvisibleChars(v) + NC;
    }
    return v;
  }

  while (lineNb < (lineNumber + 4) && stream[streamIndex]) {
    const v = stream[streamIndex].value;
    if (v.match(/\n/)) {
      lineNb++;
      if (lineNb > (lineNumber + 3)) {
        return str;
      }
      if (lineNb >= (lineNumber - 1)) {
        str += `${char(v)}${String(`     ${lineNb}`).slice(-5)}: `;
      }
    } else if (lineNb >= (lineNumber - 1)) {
      if (streamIndex === 0) {
        str += `\n${String(`     ${lineNb}`).slice(-5)}: `;
      }
      str += char(v);
    }
    streamIndex++;
  }
  return str;
}

function displayError(stream: [Token], tokensDefinition, grammar, bestFailure) {
  const sub_rules = grammar[bestFailure.type][bestFailure.sub_rule_index];
  let rule = '';
  const { token } = bestFailure;
  const firstToken = bestFailure.first_token;
  const positions = tokenPosition(token);
  let failingToken = '';
  for (let i = 0; i < sub_rules.length; i++) {
    let sr = sub_rules[i];
    if (tokensDefinition[sr] && tokensDefinition[sr].verbose) {
      sr = tokensDefinition[sr].verbose.replace(/\s/g, '-');
    }
    if (i === bestFailure.sub_rule_token_index) {
      rule += `${RED}${sr}${NC} `;
      failingToken = `${sr}`;
    } else {
      rule += `${YELLOW}${sr}${NC} `;
    }
  }
  throw new Error(`
  ${RED}Parser error at line ${positions.lineNumber + 1} char ${positions.charNumber} to ${positions.end} ${NC}
  Unexpected ${YELLOW}${replaceInvisibleChars(token.value)}${NC}
  Best match was at rule ${bestFailure.type}[${bestFailure.sub_rule_index}][${bestFailure.sub_rule_token_index}] ${rule}
  token "${YELLOW}${replaceInvisibleChars(token.value)}${NC}" (type:${token.type}) doesn't match rule item ${YELLOW}${failingToken}${NC}
  Context:
${streamContext(token, firstToken, stream)}
`);
}

function isRule(node: any): node is RuleNode {
  return typeof node.type === 'string' 
}

function printTree(node: ASTNode, sp) {
  if(isRule(node)) {
    console.log(`${sp}r ${node.type}(${node.sub_rule_index})`);
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        printTree(node.children[i], `${sp}  `);
      }
    }
  } else {
    console.log(`${sp}t ${node.type} ${node.value}`);
  }
}

function checkGrammarAndTokens(grammar, tokensDefinition) {
  const gkeys = Object.keys(grammar);
  const tkeys = Object.keys(tokensDefinition);
  const intersection = gkeys.filter(n => tkeys.indexOf(n) > -1);
  if (intersection.length > 0) {
    throw new Error(`Grammar and token have keys in common: ${intersection}`);
  }
}

function preprocessGrammar(rules) {
  return Object.keys(rules).reduce((accu, key) => {
    accu[key] = rules[key].map(
      sub_rule_index => sub_rule_index.map((sub_rule_indexItem, index) => {
        if (sub_rule_indexItem instanceof Function) {
          return { function: true, value: sub_rule_indexItem };
        }
        const values = sub_rule_indexItem.split(':');
        let optional = false;
        let repeatable = false;
        let leftRecursion = false;
        if (values[0].endsWith('?')) {
          values[0] = values[0].substring(0, values[0].length - 1);
          optional = true;
        }
        if (values[0].endsWith('*')) {
          values[0] = values[0].substring(0, values[0].length - 1);
          repeatable = true;
        }
        if (index === 0 && values[0] === key) {
          leftRecursion = true;
        }
        return {
          value: values[0],
          alias: values[1],
          optional,
          repeatable,
          leftRecursion,
        };
      }),
    );
    return accu;
  }, {});
}

export {
  streamContext,
  preprocessGrammar,
  checkGrammarAndTokens,
  displayError,
  printTree,
}
