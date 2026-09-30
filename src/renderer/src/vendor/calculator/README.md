# Vendored: andrewagain/calculator

- Source: https://github.com/andrewagain/calculator (formerly ahfarmer/calculator), MIT, see `LICENSE`.
- Commit: `37b56077e78b82bf2088ec993d55becb47538de9` (the repository is archived and not published to npm).
- Files: `src/logic/calculate.js`, `operate.js`, `isNumber.js`, copied verbatim. `calculate.d.ts` is local.

Do not edit the `.js` files. Local behavior lives in `src/renderer/src/tools/calculator.ts`:
upstream's divide-by-zero guard compares a `Big` to a string and never fires, so big.js throws;
the glue catches that and shows an error state instead.
