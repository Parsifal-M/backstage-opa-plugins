// docusaurus.config.ts
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'OPA Backstage Plugins',
  tagline: 'Bringing the Open Policy Agent to Backstage ❤️',
  favicon: 'img/favicon.ico',

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  // Set the production url of your site here
  url: 'https://parsifal-m.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/backstage-opa-plugins/',

  // GitHub pages deployment config
  organizationName: 'Parsifal-M', // Your GitHub org/user name
  projectName: 'backstage-opa-plugins', // Your repo name

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Update this to your repo path
          editUrl:
            'https://github.com/Parsifal-M/backstage-opa-plugins/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Optional: Add announcement bar
    announcementBar: {
      id: 'support_us',
      content:
        '⭐️ If you like the OPA Backstage Plugins, give the repository a star on <a href="https://github.com/Parsifal-M/backstage-opa-plugins?tab=readme-ov-file#welcome-to-the-opa-plugins-repository-for-backstage" target="_blank">GitHub</a>! ⭐️',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
      isCloseable: true,
    },

    mermaid: {
      theme: { light: 'base', dark: 'dark' },
    },

    navbar: {
      title: 'Backstage OPA Plugins',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/Parsifal-M/backstage-opa-plugins?tab=readme-ov-file#welcome-to-the-opa-plugins-repository-for-backstage',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/home',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/Parsifal-M/backstage-opa-plugins/discussions',
            },
            {
              label: 'Backstage Documentation',
              href: 'https://backstage.io/docs/',
            },
            {
              label: 'OPA Documentation',
              href: 'https://www.openpolicyagent.org/docs/latest/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Parsifal-M/backstage-opa-plugins',
            },
          ],
        },
      ],
      copyright: `Built with ❤️ by <a href="https://github.com/Parsifal-M">Parsifal-M</a> and <a href="https://github.com/Parsifal-M/backstage-opa-plugins/graphs/contributors">  Contributors</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['rego'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
