// This code is automatically generated by the meta parser, do not modify
// produced with metaParserGenerator.js

let best_failure;
let best_failure_array = [];
let best_failure_index = 0;

function record_failure(failure, i) {
  if (i > best_failure_index) {
    best_failure_array = [];
  }
  if (best_failure_array.length === 0) {
    best_failure = failure;
  }
  best_failure_array.push(failure);
  best_failure_index = i;
}

let cache = {};

function memoize(name, func) {
  return function memoize_inner(stream, index) {
    const key = `${name}-${index}`;
    let value = cache[key];
    if (value !== undefined) {
      return value;
    }
    value = func(stream, index);
    cache[key] = value;
    return value;
  };
}

let cacheR = {};

// based on https://medium.com/@gvanrossum_83706/left-recursive-peg-grammars-65dab3c580e1
function memoize_left_recur(name, func) {
  return function memoize_inner(stream, index) {
    const key = `${name}-${index}`;
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


let START_0 = (stream, index) => {
  let i = index;
  const children = [];
  const named = {};
  const node = {
    children, stream_index: index, name: 'START',
    subRule: 0, type: 'START', named,
  };
  const _rule_0 = GLOBAL_STATEMENT(stream, i);
  if (!_rule_0) return false;
  children.push(_rule_0);
  i = _rule_0.last_index;
  let _rule_1 = GLOBAL_STATEMENTS(stream, i);
  while (_rule_1) {
    children.push(_rule_1);
    i = _rule_1.last_index;
    _rule_1 = GLOBAL_STATEMENTS(stream, i);
  }

  if (stream[i].type !== 'EOS') {
    if (i >= best_failure_index) {
      const failure = {
        rule_name: 'START', sub_rule_index: 0,
        sub_rule_stream_index: i - index, sub_rule_token_index: 2,
        stream_index: i, token: stream[i], first_token: stream[index], success: false,
      };
      record_failure(failure, i);
    }
    return false;
  }

  children.push(stream[i]); i++;
  node.success = i === stream.length; node.last_index = i;
  return node;
};
START_0 = memoize('START_0', START_0);


let START_1 = (stream, index) => {
  let i = index;
  const children = [];
  const named = {};
  const node = {
    children, stream_index: index, name: 'START',
    subRule: 1, type: 'START', named,
  };
  let _rule_0 = GLOBAL_STATEMENTS(stream, i);
  while (_rule_0) {
    children.push(_rule_0);
    i = _rule_0.last_index;
    _rule_0 = GLOBAL_STATEMENTS(stream, i);
  }

  if (stream[i].type !== 'EOS') {
    if (i >= best_failure_index) {
      const failure = {
        rule_name: 'START', sub_rule_index: 1,
        sub_rule_stream_index: i - index, sub_rule_token_index: 1,
        stream_index: i, token: stream[i], first_token: stream[index], success: false,
      };
      record_failure(failure, i);
    }
    return false;
  }

  children.push(stream[i]); i++;
  node.success = i === stream.length; node.last_index = i;
  return node;
};
START_1 = memoize('START_1', START_1);


function START(stream, index) {
  return START_0(stream, index)
    || START_1(stream, index);
}
let GLOBAL_STATEMENTS_0 = (stream, index) => {
  let i = index;
  const children = [];
  const named = {};
  const node = {
    children, stream_index: index, name: 'GLOBAL_STATEMENTS',
    subRule: 0, type: 'GLOBAL_STATEMENTS', named,
  };

  if (stream[i].type !== 'newline') {
    if (i >= best_failure_index) {
      const failure = {
        rule_name: 'GLOBAL_STATEMENTS', sub_rule_index: 0,
        sub_rule_stream_index: i - index, sub_rule_token_index: 0,
        stream_index: i, token: stream[i], first_token: stream[index], success: false,
      };
      record_failure(failure, i);
    }
    return false;
  }

  children.push(stream[i]); i++;
  const _rule_1 = GLOBAL_STATEMENT(stream, i);
  if (!_rule_1) return false;
  children.push(_rule_1);
  i = _rule_1.last_index;
  node.success = i === stream.length; node.last_index = i;
  return node;
};
GLOBAL_STATEMENTS_0 = memoize('GLOBAL_STATEMENTS_0', GLOBAL_STATEMENTS_0);


let GLOBAL_STATEMENTS_1 = (stream, index) => {
  let i = index;
  const children = [];
  const named = {};
  const node = {
    children, stream_index: index, name: 'GLOBAL_STATEMENTS',
    subRule: 1, type: 'GLOBAL_STATEMENTS', named,
  };

  if (stream[i].type !== 'newline') {
    if (i >= best_failure_index) {
      const failure = {
        rule_name: 'GLOBAL_STATEMENTS', sub_rule_index: 1,
        sub_rule_stream_index: i - index, sub_rule_token_index: 0,
        stream_index: i, token: stream[i], first_token: stream[index], success: false,
      };
      record_failure(failure, i);
    }
    return false;
  }

  children.push(stream[i]); i++;
  node.success = i === stream.length; node.last_index = i;
  return node;
};
GLOBAL_STATEMENTS_1 = memoize('GLOBAL_STATEMENTS_1', GLOBAL_STATEMENTS_1);


function GLOBAL_STATEMENTS(stream, index) {
  return GLOBAL_STATEMENTS_0(stream, index)
    || GLOBAL_STATEMENTS_1(stream, index);
}
let GLOBAL_STATEMENT_0 = (stream, index) => {
  let i = index;
  const children = [];
  const named = {};
  const node = {
    children, stream_index: index, name: 'GLOBAL_STATEMENT',
    subRule: 0, type: 'GLOBAL_STATEMENT', named,
  };
  const _rule_0 = math_operation(stream, i);
  if (!_rule_0) return false;
  children.push(_rule_0);
  i = _rule_0.last_index;
  node.success = i === stream.length; node.last_index = i;
  return node;
};
GLOBAL_STATEMENT_0 = memoize('GLOBAL_STATEMENT_0', GLOBAL_STATEMENT_0);


function GLOBAL_STATEMENT(stream, index) {
  return GLOBAL_STATEMENT_0(stream, index);
}
let math_operation_0 = (stream, index) => {
  let i = index;
  const children = [];
  const named = {};
  const node = {
    children, stream_index: index, name: 'math_operation',
    subRule: 0, type: 'math_operation', named,
  };
  const _rule_0 = math_operation(stream, i);
  if (!_rule_0) return false;
  children.push(_rule_0);
  i = _rule_0.last_index;

  if (stream[i].type !== 'math_operator') {
    if (i >= best_failure_index) {
      const failure = {
        rule_name: 'math_operation', sub_rule_index: 0,
        sub_rule_stream_index: i - index, sub_rule_token_index: 1,
        stream_index: i, token: stream[i], first_token: stream[index], success: false,
      };
      record_failure(failure, i);
    }
    return false;
  }

  children.push(stream[i]); i++;

  if (stream[i].type !== 'number') {
    if (i >= best_failure_index) {
      const failure = {
        rule_name: 'math_operation', sub_rule_index: 0,
        sub_rule_stream_index: i - index, sub_rule_token_index: 2,
        stream_index: i, token: stream[i], first_token: stream[index], success: false,
      };
      record_failure(failure, i);
    }
    return false;
  }

  children.push(stream[i]); i++;
  node.success = i === stream.length; node.last_index = i;
  return node;
};
math_operation_0 = memoize_left_recur('math_operation_0', math_operation_0);


let math_operation_1 = (stream, index) => {
  let i = index;
  const children = [];
  const named = {};
  const node = {
    children, stream_index: index, name: 'math_operation',
    subRule: 1, type: 'math_operation', named,
  };

  if (stream[i].type !== 'number') {
    if (i >= best_failure_index) {
      const failure = {
        rule_name: 'math_operation', sub_rule_index: 1,
        sub_rule_stream_index: i - index, sub_rule_token_index: 0,
        stream_index: i, token: stream[i], first_token: stream[index], success: false,
      };
      record_failure(failure, i);
    }
    return false;
  }

  children.push(stream[i]); i++;
  node.success = i === stream.length; node.last_index = i;
  return node;
};
math_operation_1 = memoize('math_operation_1', math_operation_1);


function math_operation(stream, index) {
  return math_operation_0(stream, index)
    || math_operation_1(stream, index);
}
function _tokenize(tokenDef, input, stream) {
  let match;
  match = input.match(tokenDef.number.reg);
  if (match !== null) {
    return [match[0], 'number'];
  }
  match = input.match(tokenDef.comment.reg);
  if (match !== null) {
    return [match[0], 'comment'];
  }
  match = input.match(tokenDef.multiline_comment.reg);
  if (match !== null) {
    return [match[0], 'multiline_comment'];
  }
  if (input.startsWith(',')) {
    return [',', ','];
  }
  if (input.startsWith('.')) {
    return ['.', '.'];
  }
  if (input.startsWith('(')) {
    return ['(', '('];
  }
  if (input.startsWith(')')) {
    return [')', ')'];
  }
  if (input.startsWith('{')) {
    return ['{', '{'];
  }
  if (input.startsWith('}')) {
    return ['}', '}'];
  }
  if (input.startsWith('>')) {
    return ['>', '>'];
  }
  if (input.startsWith('<')) {
    return ['<', '<'];
  }
  match = input.match(tokenDef.name.reg);
  if (match !== null) {
    return [match[0], 'name'];
  }
  match = input.match(tokenDef.math_operator.reg);
  if (match !== null) {
    return [match[0], 'math_operator'];
  }
  if (input.startsWith('!')) {
    return ['!', 'unary'];
  }
  if (input.startsWith('=')) {
    return ['=', '='];
  }
  if (input.startsWith(':')) {
    return [':', 'colon'];
  }
  if (input.startsWith(`
`)) {
    return [`
`, 'newline'];
  }
  match = tokenDef.str.func(input, stream);
  if (match !== undefined) {
    return [match, 'str'];
  }
  match = tokenDef.w.func(input, stream);
  if (match !== undefined) {
    return [match, 'w'];
  }
  match = input.match(tokenDef.W.reg);
  if (match !== null) {
    return [match[0], 'W'];
  }
  return [null, 'W'];
}
function tokenize(tokenDef, input) {
  const stream = [];
  let lastToken;
  let key;
  let candidate = null;
  const len = input.length;
  let char = 0;
  let index = 0;
  let line = 0;
  let column = 0;
  while (char < len) {
    [candidate, key] = _tokenize(tokenDef, input, stream);
    if (candidate !== null) {
      lastToken = {
        type: key,
        value: candidate,
        start: char,
        stream_index: index,
        len: candidate.length,
        lineStart: line,
        columnStart: column,
      };
      const lines = candidate.split('\n');
      if (lines.length > 1) {
        line += lines.length - 1;
        column = lines[lines.length - 1].length;
      } else {
        column += candidate.length;
      }
      lastToken.lineEnd = line;
      lastToken.columnEnd = column;
      stream.push(lastToken);
      index++;
      char += candidate.length;
      input = input.substr(candidate.length);
    } else {
      if (stream.length === 0) {
        throw new Error('Tokenizer error: total match failure');
      }
      if (lastToken) {
        lastToken.pointer += lastToken.value.length;
      }
      let msg = `Tokenizer error, no matching token found for ${input.slice(0, 26)}`;
      if (lastToken) {
        msg += `Before token of type ${lastToken.type}: ${lastToken.value}`;
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

module.exports = {
  parse: (stream) => {
    best_failure = null;
    best_failure_index = 0;
    best_failure_array = [];
    cache = {};
    cacheR = {};
    const result = START(stream, 0);
    if (!result) {
      return best_failure;
    }
    return result;
  },
  tokenize,
};
