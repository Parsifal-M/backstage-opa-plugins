// docusaurus.config.ts
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'OPA Backstage Plugins',
  tagline: 'Bringing OPA to Backstage ❤️',
  favicon: 'img/favicon.ico',

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
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Update this to your repo path
          editUrl:
            'https://github.com/Parsifal-M/backstage-opa-plugins/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',

    // Optional: Add announcement bar
    announcementBar: {
      id: 'support_us',
      content:
        '⭐️ If you like OPA Backstage Plugins, give it a star on GitHub! ⭐️',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
      isCloseable: true,
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
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/Parsifal-M/backstage-opa-plugins',
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
              to: '/docs/intro',
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
              label: 'Backstage Community',
              href: 'https://github.com/backstage/community',
            },
            {
              label: 'OPA Community',
              href: 'https://www.openpolicyagent.org/docs/latest/#community',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Parsifal-M/backstage-opa-plugins',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Backstage OPA Plugins. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
