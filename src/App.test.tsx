import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('Races component matches the snapshot', () => {
  const component = render(<App />);
  expect(component).toMatchSnapshot();
});

// global.fetch = jest.fn(() => 
//   Promise.resolve({
//     json: () => Promise.resolve({
//       data: {
//         next_to_go_ids: [],
//         race_summaries: {},
//       }
//     }),
//   })
// );

// test('Mocking the endpoint', () => {
//   const component = render(<App />);
//   expect(fetch).toHaveBeenCalled(1);
// });
