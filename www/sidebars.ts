import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'getting-started',
    'installation',
    'basic-usage',
    {
      type: 'category',
      label: 'API Reference',
      link: {
        type: 'doc',
        id: 'api-reference',
      },
      items: [
        'api-reference/litert-provider',
        'api-reference/use-model',
        'api-reference/use-litert-runtime',
        'api-reference/use-litert-tfjs-model',
        'api-reference/use-litert-model',
      ],
    },
    'advanced-usage',
    'examples',
  ],
};

export default sidebars;
