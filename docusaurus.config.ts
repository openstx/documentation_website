import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// NOTE: openstxfoundation.org's exact page paths could not be verified from
// this environment (outbound network access to openstxfoundation.org is
// blocked here). The hrefs below are best-guess paths matching a typical
// OpenSTX Foundation site structure (About / Members / Participate /
// Publications / Contact) — double check and adjust them against the live
// site before merging.
const OPENSTX_SITE_URL = 'https://openstxfoundation.org';

const config: Config = {
  title: 'OpenSTX Specification',
  tagline:
    'Draft specification for Synchronous Transmission (STX) technology',
  favicon: 'img/favicon.ico',

  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://docs.openstxfoundation.org',
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'openstx',
  projectName: 'documentation_website',

  onBrokenLinks: 'throw',

  // The specification submodule's .md files are plain CommonMark (tables,
  // angle-bracket placeholders like `<LAYER_NAME>_<COMMAND_NAME>_Command`,
  // etc.) rather than MDX, and aren't ours to rewrite — 'detect' parses
  // .md files as plain Markdown while still allowing .mdx where used.
  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          // The rendered content is symlinked in from the `specification`
          // git submodule (openstx/public-specification) by
          // scripts/sync-specification.mjs — there is no single stable
          // "edit this page" URL to point at, so the default link is
          // disabled rather than pointing somewhere wrong.
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/openstx-logo.svg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'OpenSTX',
      logo: {
        alt: 'OpenSTX logo',
        src: 'img/openstx-logo.svg',
      },
      items: [
        {href: `${OPENSTX_SITE_URL}/about`, label: 'About', position: 'left'},
        {
          href: `${OPENSTX_SITE_URL}/members`,
          label: 'Members',
          position: 'left',
        },
        {
          href: `${OPENSTX_SITE_URL}/participate`,
          label: 'Participate',
          position: 'left',
        },
        {
          href: `${OPENSTX_SITE_URL}/publications`,
          label: 'Publications',
          position: 'left',
        },
        {
          href: `${OPENSTX_SITE_URL}/contact`,
          label: 'Contact',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'specSidebar',
          position: 'right',
          label: 'Specification',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Specification',
          items: [
            {
              label: 'Core Services',
              to: '/docs/spec-core/introduction',
            },
            {
              label: 'RAL Services',
              to: '/docs/spec-rail/introduction',
            },
            {
              label: 'Glossary',
              to: '/docs/glossary',
            },
          ],
        },
        {
          title: 'OpenSTX',
          items: [
            {label: 'About', href: `${OPENSTX_SITE_URL}/about`},
            {label: 'Members', href: `${OPENSTX_SITE_URL}/members`},
            {label: 'Participate', href: `${OPENSTX_SITE_URL}/participate`},
            {label: 'Publications', href: `${OPENSTX_SITE_URL}/publications`},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'openstxfoundation.org', href: OPENSTX_SITE_URL},
            {
              label: 'public-specification (GitHub)',
              href: 'https://github.com/openstx/public-specification',
            },
            {
              label: 'Contact',
              href: `${OPENSTX_SITE_URL}/contact`,
            },
          ],
        },
      ],
      copyright: `OpenSTX is hosted at the Linux Foundation. Copyright © ${new Date().getFullYear()} The Linux Foundation. This draft specification is not an approved release.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
