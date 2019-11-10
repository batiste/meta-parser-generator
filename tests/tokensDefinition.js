
function strDef(input) {
  let i; let ch;
  const first = input.charAt(0);
  if (first === '"' || first === "'" || first === '`') {
    i = 1;
    while (input.charAt(i)) {
      ch = input.charAt(i);
      if (ch === '\\') {
        i++;
      } else if (ch === first) {
        return input.slice(0, i + 1);
      }
      i++;
    }
  }
}

function singleSpace(input) {
  if (input[0] === ' ' && input[1] !== ' ') {
    return ' ';
  }
}

const tokensDefinition = {
  'number': { reg: /^[0-9]+(\.[0-9]*)?/ },
  'comment': { reg: /^\/\/[^\n]*/, verbose: 'comment' },
  'multiline_comment': { reg: /^\/\*+[^*]*\*+(?:[^/*][^*]*\*+)*\//, verbose: 'comment' },
  ',': { str: ',' },
  '.': { str: '.' },
  '(': { str: '(' },
  ')': { str: ')' },
  '{': { str: '{' },
  '}': { str: '}' },
  '>': { str: '>' },
  '<': { str: '<' },
  'name': { reg: /^[\w|$|_]+/ },
  'math_operator': { reg: /^(\+|\/|-|\*|\^|~|%)/ },
  'unary': { str: '!' },
  '=': { str: '=' },
  'colon': { str: ':' },
  'newline': { str: '\n' },
  'str': { func: strDef, verbose: 'string' },
  'w': { func: singleSpace, verbose: 'single white space' },
  'W': { reg: /^[\s]+/, verbose: 'multiple white spaces' },
};

module.exports = {
  tokensDefinition,
};
