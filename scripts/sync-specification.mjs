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
    dest: 'spec-general',
    label: 'General Description',
    description: 'Cross-cutting concepts and primitives shared by all layers.',
    source: 'spec-general-description',
  },
  {
    dest: 'spec-core',
    label: 'Core Services',
    description: 'Services provided by the OpenSTX Core layer.',
    source: 'spec-core-services',
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
    // Shown as a direct sidebar link rather than an expandable category, so
    // this one is handled separately from the other (folder) sections below.
    dest: 'glossary',
    label: 'Glossary',
    description: 'Centralized definitions of terms, concepts, and acronyms.',
    source: 'glossary.md',
    flat: true,
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
    // Single-file section becomes `<dest>.md` (flat) or `<dest>/index.md`.
    const destFile = section.flat ? `${section.dest}.md` : `${section.dest}/index.md`;
    return [[`../${section.source}`, `../${destFile}`]];
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
    if (section.flat) {
      fs.rmSync(path.join(DOCS_DIR, `${section.dest}.md`), { force: true });
    }
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

// Inserts/overwrites frontmatter fields (e.g. `sidebar_position` so
// "Introduction"/"Overview" pages sort to the top of their section's menu,
// `sidebar_label` so a flat doc's sidebar entry doesn't just mirror its H1).
function setFrontmatter(content, fields) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  let body = frontmatterMatch ? frontmatterMatch[1] : '';
  for (const [key, value] of Object.entries(fields)) {
    body = body.replace(new RegExp(`^${key}:.*$\\r?\\n?`, 'm'), '');
  }
  const lines = Object.entries(fields).map(([key, value]) => `${key}: ${value}`);
  const newFrontmatter = `---\n${lines.join('\n')}\n${body ? body + '\n' : ''}---\n`;
  const rest = frontmatterMatch ? content.slice(frontmatterMatch[0].length) : '\n' + content;
  return newFrontmatter + rest;
}

function setSidebarPosition(content, position) {
  return setFrontmatter(content, { sidebar_position: position });
}

// Ranks a section's top-level pages so "introduction" sorts first and
// "overview" sorts second, keeping every other page in its existing
// (alphabetical) order after them.
function applySidebarPositions(destDir) {
  const entries = fs
    .readdirSync(destDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')))
    .map((entry) => entry.name)
    .sort();

  const rank = (name) => {
    if (/introduction/i.test(name)) return 0;
    if (/overview/i.test(name)) return 1;
    return 2;
  };
  const ordered = [...entries].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

  ordered.forEach((name, index) => {
    const filePath = path.join(destDir, name);
    fs.writeFileSync(filePath, setSidebarPosition(fs.readFileSync(filePath, 'utf8'), index + 1));
  });
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

  if (section.flat) {
    // Rendered as a direct sidebar link (e.g. Glossary) rather than an
    // expandable category, so it's a single top-level doc file instead of a
    // folder with its own `_category_.json`.
    const content = rewriteLinks(fs.readFileSync(sourcePath, 'utf8'));
    fs.writeFileSync(
      path.join(DOCS_DIR, `${section.dest}.md`),
      setFrontmatter(content, { sidebar_position: position, sidebar_label: section.label }),
    );
    return;
  }

  if (fs.statSync(sourcePath).isDirectory()) {
    copyDirRecursive(sourcePath, destPath);
    applySidebarPositions(destPath);
  } else {
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
