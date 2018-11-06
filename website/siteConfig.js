/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config.html for all the possible
// site configuration options.

/* List of projects/orgs using your project for the users page */

const siteConfig = {
    title: '@tinkoff/request' /* title for your website */,
    tagline: 'Construct your own request library',
    baseUrl: '/tinkoff-request/' /* base url for your project */,
    // For github.io type URLs, you would set the url and baseUrl like:
    //   url: 'https://facebook.github.io',
    //   baseUrl: '/test-site/',

    // Used for publishing and more
    projectName: 'tinkoff-request',
    organizationName: 'TinkoffCreditSystems',
    // For top-level user or org sites, the organization is still the same.
    // e.g., for the https://JoelMarcey.github.io site, it would be set like...
    //   organizationName: 'JoelMarcey'

    // For no header links in the top nav bar -> headerLinks: [],
    headerLinks: [
        { doc: 'core/index', label: 'Core' },
        { doc: 'plugins/index', label: 'Plugins' },
        { doc: 'how-to/index', label: 'How to' },
        { href: 'https://github.com/TinkoffCreditSystems/tinkoff-request', label: 'GitHub' }
    ],

    // If you have users set above, you add it here:
    // users,

    /* path to images for header/footer */
    headerIcon: 'img/logo-tinkoff.svg',
    footerIcon: 'img/logo-tinkoff.svg',
    favicon: 'img/favicon.png',

    /* colors for website */
    colors: {
        primaryColor: '#3B3738',
        secondaryColor: '#843131'
    },

    /* custom fonts for website */
    /* fonts: {
      myFont: [
        "Times New Roman",
        "Serif"
      ],
      myOtherFont: [
        "-apple-system",
        "system-ui"
      ]
    }, */

    // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
    copyright:
        `Copyright © ${
            new Date().getFullYear()
        } tinkoff.ru`,

    highlight: {
        // Highlight.js theme to use for syntax highlighting in code blocks
        theme: 'default'
    },

    // Add custom scripts here that would be placed in <script> tags
    // scripts: ['https://buttons.github.io/buttons.js'],

    /* On page navigation for the current documentation page */
    onPageNav: 'separate',
    scrollToTop: true,
    scrollToTopOptions: {
        zIndex: 100
    },
    stylesheets: ['/css/custom.css'],
    repoUrl: 'https://github.com/TinkoffCreditSystems/tinkoff-request'
};

module.exports = siteConfig;
