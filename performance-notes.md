# Performance Improvements

## Tokenizer Optimization (v1.0.4)

### Previous Implementation (O(n²))
The tokenizer was creating a new string on every token match:
```javascript
while (char < len) {
  [candidate, key] = _tokenize(tokenDef, input, stream);
  // ...
  input = input.slice(candidate.length); // ❌ Creates new string!
}
```

For a 10KB input with 1000 tokens:
- Creates ~1000 intermediate strings
- Total memory allocation: ~5MB (accumulated)
- Time complexity: O(n²) due to string copying

### Current Implementation (O(n))
Uses index-based parsing:
```javascript
const originalInput = input;
while (char < len) {
  [candidate, key] = _tokenize(tokenDef, originalInput, char, stream);
  // ...
  char += candidateLen; // ✅ Just increments index!
}
```

For a 10KB input with 1000 tokens:
- Zero intermediate strings created
- Total memory allocation: ~10KB (original string only)
- Time complexity: O(n)

### Additional Optimizations
1. **Conditional newline splitting**: Only split token value on `\n` if it contains newlines
2. **Pre-computed string lengths**: Use cached length for fixed string tokens
3. **Better error messages**: Show context "After" instead of "Before" for clarity

### Expected Performance Impact
- **Small files (< 1KB)**: Negligible difference (< 1ms)
- **Medium files (10-100KB)**: 20-50% faster tokenization
- **Large files (> 1MB)**: 2-5x faster, significantly reduced memory pressure
- **Very large files (> 10MB)**: Major improvement, prevents potential out-of-memory errors

## Parser Characteristics

### Complexity Analysis
- **Tokenization**: O(n) where n = input length
- **Parsing**: O(n × m) worst case, O(n) with packrat memoization
  - n = token stream length
  - m = number of grammar rules
- **Memory**: O(n × m) for memoization cache
  - Cache is cleared between parse() calls
  - For very large files, consider streaming or chunked parsing

### PEG vs LL Parser
This is a **PEG (Parsing Expression Grammar) parser**, not an LL parser:
- Uses **ordered choice** (first match wins)
- **Packrat parsing** with memoization
- **Linear time complexity** with memoization
- Grammar rule order matters (more specific rules should come first)
