#!/usr/bin/env node
// Copies content from the `specification` git submodule (openstx/public-specification)
// into `docs/` so Docusaurus picks it up as doc pages. Re-run on every build/start
// (wired as npm's prebuild/prestart) so submodule edits/updates show up on rebuild.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SPEC_DIR = path.join(ROOT, 'specification');
const DOCS_DIR = path.join(ROOT, 'docs');

// Order here is the order the sections appear in the sidebar.
const SECTIONS = [
  {
    dest: 'spec-core',
    label: 'Core Services',
    description: 'Services provided by the OpenSTX Core layer.',
    source: 'spec-core-services',
  },
  {
    dest: 'spec-general',
    label: 'General Description',
    description: 'Cross-cutting concepts and primitives shared by all layers.',
    source: 'spec-general-description',
  },
  {
    dest: 'spec-rail',
    label: 'RAL Services',
    description: 'Services provided by the Radio Abstraction Layer (RAL).',
    source: 'spec-ral-services',
  },
  {
    dest: 'spec-security',
    label: 'Security',
    description: 'Frame security across the RAL and Core layers.',
    source: 'spec-security',
  },
  {
    dest: 'glossary',
    label: 'Glossary',
    description: 'Centralized definitions of terms, concepts, and acronyms.',
    source: 'glossary.md',
  },
];

// The submodule's markdown cross-references each other by the *original*
// directory names (e.g. `../spec-ral-services/ral-overview.md`,
// `../glossary.md`), but our sidebar section names (task requirement) don't
// match those directory names 1:1 (e.g. spec-ral-services -> spec-rail,
// glossary.md -> glossary/index.md). Rewrite those relative links as content
// is copied in, so cross-section links keep working under the renamed
// sidebar structure instead of 404ing / resolving to nothing.
const LINK_REWRITES = SECTIONS.flatMap((section) => {
  if (section.source === section.dest) return [];
  if (section.source.endsWith('.md')) {
    // Single-file section becomes `<dest>/index.md`.
    return [[`../${section.source}`, `../${section.dest}/index.md`]];
  }
  return [[`../${section.source}/`, `../${section.dest}/`]];
});

function rewriteLinks(content) {
  return LINK_REWRITES.reduce((text, [from, to]) => text.split(from).join(to), content);
}

function assertSubmoduleIsPresent() {
  if (!fs.existsSync(SPEC_DIR) || fs.readdirSync(SPEC_DIR).length === 0) {
    console.error(
      '\n[sync-specification] "specification/" submodule is missing or empty.\n' +
        'Run: git submodule update --init --remote specification\n',
    );
    process.exit(1);
  }
}

function rmManagedDocsSections() {
  for (const section of SECTIONS) {
    fs.rmSync(path.join(DOCS_DIR, section.dest), { recursive: true, force: true });
  }
}

// Recursively copies every file/dir under `srcDir` into `destDir`, preserving
// structure. This re-runs before every `start`/`build` (see package.json's
// "pre*" scripts), so submodule edits/updates still show up on rebuild even
// though the docs/ copy itself isn't a live link. Markdown files are rewritten
// in-flight (see `rewriteLinks`); every other file is copied byte-for-byte.
function copyDirRecursive(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      fs.writeFileSync(destPath, rewriteLinks(fs.readFileSync(srcPath, 'utf8')));
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function writeCategory(dest, label, description, position) {
  const categoryPath = path.join(DOCS_DIR, dest, '_category_.json');
  fs.writeFileSync(
    categoryPath,
    JSON.stringify(
      {
        label,
        position,
        link: { type: 'generated-index', description },
      },
      null,
      2,
    ) + '\n',
  );
}

function syncSection(section, position) {
  const sourcePath = path.join(SPEC_DIR, section.source);
  const destPath = path.join(DOCS_DIR, section.dest);

  if (!fs.existsSync(sourcePath)) {
    console.warn(`[sync-specification] skipping "${section.dest}": ${section.source} not found in submodule`);
    return;
  }

  if (fs.statSync(sourcePath).isDirectory()) {
    copyDirRecursive(sourcePath, destPath);
  } else {
    // Single-file section (glossary.md) becomes the index doc of its own folder.
    fs.mkdirSync(destPath, { recursive: true });
    fs.writeFileSync(path.join(destPath, 'index.md'), rewriteLinks(fs.readFileSync(sourcePath, 'utf8')));
  }

  writeCategory(section.dest, section.label, section.description, position);
}

assertSubmoduleIsPresent();
fs.mkdirSync(DOCS_DIR, { recursive: true });
rmManagedDocsSections();
SECTIONS.forEach((section, index) => syncSection(section, index + 1));
console.log(`[sync-specification] copied ${SECTIONS.length} sections from specification/ into docs/`);
