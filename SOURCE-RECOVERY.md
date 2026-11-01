# Original-source search record (superseded by reconstruction)

The original development source was not located. After this search, the user explicitly authorized reconstruction. The branch now contains reconstructed JavaScript source and an actual build; see [RECONSTRUCTION.md](RECONSTRUCTION.md). This document records the earlier search, not the current build status. Review approval is not guaranteed. No reconstructed code is represented as original.

The local repository is based on `eb45cf7`. Its reachable history has no `.ts`
files, `package.json`, TypeScript configuration or build configuration. Historical
`main.js` at `3365374` is a generated bundle with module-name comments. Commit
`066cd0a` stopped tracking that bundle. Excluding a generated bundle is not itself
the problem: the development files needed to produce it were never included in
the inspected reachable history.

Searches of Buckingham's development, Documents, Downloads, source, Desktop,
OneDrive and temporary work directories found bundled copies only. The matching
plugin ZIP files, including the file named `project-milestone-gpt-tracker-original.zip`,
contain no original TypeScript/build files. Unrelated email-ingest source in an
older ZIP is a different plugin and cannot repair this repository.

The current installed and working bundles agree. The historical bundle already
has column sorting, the configurable Project Momentum limit and full Iconize pack
catalogue/previews. The installed bundle additionally has optional GPT task Output
tag creation and the Asana review/import workflow. All of these features must be
preserved; the installed bundle must not be replaced by a build of older source.

## Changes prepared on this branch

- Stop distributing runtime `data.json`; ignore it, vault metadata and environment
  files. This removes it from the proposed current tree, not from existing history.
- Correct README build instructions that refer to files absent from this checkout.
- Record this blocker without pretending a generated bundle is original source.

## Recovery options recorded before reconstruction

Supply the original source/build archive or original development repository. Then
port the later bundle changes into those source modules, add pinned dependencies
and build/type/regression checks, and verify the produced artifact against the
preserved current behavior before considering publication.

If originals cannot be recovered, a separately authorized **reconstruction** could
create maintainable modules and a reproducible build from the current behavior.
That would be new reconstructed source with explicit provenance, not recovery of
the original files. Reconstruction has since been authorized and performed; see RECONSTRUCTION.md for current details.

No release, review resubmission, push, installed plugin replacement, settings
change or vault-note change was performed.
