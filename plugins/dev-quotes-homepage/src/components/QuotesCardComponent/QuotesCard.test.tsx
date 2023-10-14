import React from 'react';
import { render } from '@testing-library/react';
import { QuoteCard } from './QuotesCard';

// Mock your quotes array for testing purposes
jest.mock('../../quotes', () => ({
  quotes: [{ text: 'Sample quote text', author: 'Sample author' }],
}));

describe('QuoteCard', () => {
  it('renders a quote', () => {
    const { getByText } = render(<QuoteCard />);

    // Assert that the quote text and author are displayed
    const quoteText = getByText('Sample quote text');
    const quoteAuthor = getByText('Sample author');

    expect(quoteText).toBeInTheDocument();
    expect(quoteAuthor).toBeInTheDocument();
  });
});
