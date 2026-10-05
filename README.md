# OpenSTX Specification — Documentation Website

The documentation site for the OpenSTX specification, built with
[Docusaurus](https://docusaurus.io/). Deployed at
[docs.openstx.org](https://docs.openstx.org).

The specification content itself lives in a separate repository,
[openstx/public-specification](https://github.com/openstx/public-specification),
included here as a git submodule at `specification/`.

## Getting the submodule

Clone with submodules, or initialize it after cloning:

```bash
git clone --recurse-submodules <this repo>
# or, if already cloned:
git submodule update --init --remote
```

## Local Development

```bash
npm install
npm run start
```

`npm run start` (and `npm run build`) automatically run
`scripts/sync-specification.mjs` first (via the `prestart`/`prebuild` npm
hooks). That script copies the `spec-core-services`, `spec-general-description`,
`spec-ral-services`, `spec-security`, and `glossary.md` content from the
`specification/` submodule into `docs/` as the `spec-core`, `spec-general`,
`spec-rail`, `spec-security`, and `glossary` doc sections, in that order, and
rewrites the cross-references between them to match. Re-run `npm run start`
or `npm run build` any time the submodule is updated
(`git submodule update --remote specification`) to pull in the latest content.

The generated `docs/spec-*` and `docs/glossary` folders are not checked in —
see `.gitignore`.

## Build

```bash
npm run build
```

Generates static content into the `build` directory.

## Deployment

Pushes to `main` are built and deployed to GitHub Pages automatically by
`.github/workflows/deploy.yml`, which also fast-forwards the `specification`
submodule to the latest `public-specification` `main` before building.
