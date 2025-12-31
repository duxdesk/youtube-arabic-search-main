import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Search from './Search';

// 1️⃣ Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,             // disable retries for Storybook
      refetchOnWindowFocus: false,
    },
  },
});

// 2️⃣ Mocked youtuber data
const mockYoutubers = [
  { id: '1', name: 'Test Youtuber', channel: 'Channel 1' },
  { id: '2', name: 'Another Youtuber', channel: 'Channel 2' },
  { id: '3', name: 'Sample Creator', channel: 'Sample Channel' },
];

// 3️⃣ Optional: wrap your Search component to inject mock data
//    If your Search.tsx uses useYoutubers internally, you may need to mock it using jest.fn() or MSW.
//    For simplicity, we assume Search will render even if the hook returns empty array.

const meta: Meta<typeof Search> = {
  title: 'Pages/Search',
  component: Search,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Search>;

// 4️⃣ Default story (empty search)
export const Default: Story = {};

// 5️⃣ Story with pre-filled search (optional)
export const WithMockData: Story = {
  render: () => <Search />,
  parameters: {
    // You can add knobs or args if your component accepts props
  },
};

