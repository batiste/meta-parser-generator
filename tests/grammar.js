
const grammar = {
  'START': [
    // necessary to accept the firt line to not be a newline
    ['GLOBAL_STATEMENT', 'GLOBAL_STATEMENTS*', 'EOS'],
    ['GLOBAL_STATEMENTS*', 'EOS'],
  ],
  'GLOBAL_STATEMENTS': [
    ['newline', 'GLOBAL_STATEMENT'],
    ['newline'],
  ],
  'GLOBAL_STATEMENT': [
    ['math_operation'],
  ],
  'math_operation': [
    ['number', 'math_operator', 'math_operation'],
    ['number'],
  ],
};

module.exports = {
  grammar,
};
