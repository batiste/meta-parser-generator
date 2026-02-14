
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

export interface TokenDefinition {
  str?: string;
  reg?: RegExp;
  func?: (input: string, stream: Token[]) => string | undefined;
  verbose?: string;
}

export type TokensDefinition = Record<string, TokenDefinition>;

export type Grammar = Record<string, string[][]>;

export interface ProcessedRule {
  value: string;
  alias?: string;
  optional: boolean;
  repeatable: boolean;
  leftRecursion: boolean;
  function?: boolean;
}

export type ProcessedGrammar = Record<string, ProcessedRule[][]>;

export interface ParseFailure {
  type: string;
  sub_rule_index: number;
  sub_rule_stream_index: number;
  sub_rule_token_index: number;
  stream_index: number;
  token: Token;
  first_token: Token;
  success: false;
}