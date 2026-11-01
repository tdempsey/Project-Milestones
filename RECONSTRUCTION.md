# Reconstructed source â€” not recovered originals

Original TypeScript and build files were not located. This source was reconstructed
from the preserved current working bundle on November 1, 2026, with explicit user
authorization. It is not claimed to be original TypeScript, independently recovered
source, or a guarantee of Obsidian review approval.

Behavior reference SHA-256:
`4ea6bed328790adb2cdfe539d5352b12d741ae33e57c7dda3dab2724230c5c24`.

## Structure and build

The readable JavaScript is separated into `src/` files for the model, data loading,
dashboard, board, icon rendering/catalogue, creation/editing modals, Asana import,
settings and plugin lifecycle. Some temporary variable names from the generated
reference remain intentionally unchanged to minimize behavior changes.

These are shared-scope JavaScript source units, not independent ES modules.
`source-order.json` explicitly lists their initialization order. Avoid duplicate
top-level names; add dependencies before units that evaluate them at load time.
Functions may refer to later units when called after plugin initialization.

The dependency-free Node builder reads these sources, checks their syntax,
combines them, adds the CommonJS Obsidian entry point and copies the manifest/CSS.
It never reads an installed plugin, a vault, or a preserved reference bundle.
There is no minification, timestamp, machine path or network input in the build.

Tested Node: 25.2.0 (`.node-version`); supported build baseline: Node 22+.

```
npm ci
npm run verify
```

The build produces `dist/project-milestone-gpt-tracker/{main.js,manifest.json,styles.css}`.
Test dependencies are exact-version development dependencies in `package-lock.json`.
The lock entries and upstream integrity hashes were recovered from an existing
local npm lockfile. A subsequent clean `npm ci` against the official registry
passed in a disposable copy using Node's `--use-system-ca` option after default
Node CA trust failed certificate verification. TLS verification stayed enabled;
no system or user npm settings were changed. On a similarly configured machine,
use `node --use-system-ca <npm-cli.js> ci` if standard `npm ci` reports that error.
No runtime library other than Obsidian's provided API is required. This is a
JavaScript project; syntax and behavior are checked, not TypeScript types.

## Verification scope

The regression suites execute the rebuilt artifact with mocked Obsidian/DOM/vault
APIs. They cover sorting, empty values, retained interactions, Project Momentum's
optional setting/default-five limit, Iconize catalogue/preview/sanitization,
Output tag creation/reload, and Asana parsing/review/confirmation/duplicate and
failure handling. Pack-shaped committed fixtures are synthetic geometry, not
redistributed third-party icon packs. Separate local checks also exercised the
rebuilt artifact against the original installed-pack fixtures.

The manifest version remains 1.6.0 as a preparation baseline; no release was made.
The new artifact differs textually from the preserved bundle (module comments,
named host API bindings, removed bundler boilerplate and new export footer). Runtime
behavior is intended to remain unchanged; automated tests are not a complete UI
or integration guarantee. Live Obsidian UI testing, full real-pack refresh and
manual Asana workflow verification remain review steps before any publication.

## Publication boundaries

No personal vault notes, runtime `data.json`, installed settings, credentials,
environment files or original third-party icon-pack ZIPs belong in this tree.
The old repository history may still contain tracked runtime settings; removing
the file from this proposed tree does not rewrite that history. Review it before
publication. The installed plugin was not replaced.

A separate review-branch push was subsequently authorized. Before submission,
review this reconstruction/provenance and diff, test in a disposable vault, and
separately authorize any release or review resubmission. Obsidian reviewers decide whether the reconstructed source
satisfies their requirements.

Live UI smoke testing was unavailable in this execution session because the
Windows automation skill requires a node_repl tool that was not exposed. No
Obsidian process was launched or real vault modified for verification.
