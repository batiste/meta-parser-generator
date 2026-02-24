# Changelog

All notable changes to this project will be documented here.

## [1.2.0] – 2026-02-24

### Fixed
- **Left recursion with multiple left-recursive alternatives.**  
  Previously `memoize_left_recur` was applied to each individual alternative
  function (e.g. `exp_0`, `exp_1`) instead of the combined rule function.
  This prevented the seed from growing when a non-left-recursive base
  alternative appeared before a left-recursive one, and isolated the grow
  loops of distinct left-recursive alternatives from each other.  
  The fix wraps the **combined** rule function with `memoize_left_recur` so
  every alternative participates in each growth iteration, matching Guido van
  Rossum's algorithm. Individual left-recursive alternatives no longer receive
  their own memoize wrapper when the rule has any left-recursive alternative.

### Changed
- **ESM-only package.**  
  The package now ships as native ES Modules (`"type": "module"`).  
  TypeScript sources are compiled with `"module": "NodeNext"` / `"moduleResolution": "NodeNext"`.  
  All local imports use explicit `.js` extensions as required by Node.js ESM.  
  Test scripts use `NODE_OPTIONS=--experimental-vm-modules` for Jest ESM support.

## [1.1.2] – prior release

Initial public release with CommonJS output, packrat memoization, and
direct left-recursion support via Guido van Rossum's seed-grow algorithm.
