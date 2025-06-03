import '../src/app/globals.css';
import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { SWRConfig } from 'swr';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) => (
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <Story />
      </SWRConfig>
    ),
  ],
};

export default preview; 