
export type ASTNode = RuleNode | Token

export interface RuleNode {
  stream_index: number                // position of the first token for this rule in the token stream
  type: string                        // name of the rule
  sub_rule_index: number                     // index of this grammar rule in the sub_rule_index array
  children: [ASTNode]                 // list of children
  named: { [key: string]: ASTNode; }  // named elements withing this rule, see named aliases 
}


export interface Token {
  stream_index: number // position of the token in the token stream
  type: string         // name of token
  value: string        // the value of the token
  len: number          // shortcut for value.length
  line_start: number   // line start position in the input
  column_start: number // column start position in the input
  start: number        // character start position in the input 
}