import { Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import React from 'react';
import { quotes } from '../../quotes';

export const QuoteCard = () => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <InfoCard>
        <Typography variant="h6">
          {randomQuote.text}
        </Typography>
        <Typography variant='subtitle2'>{randomQuote.author}</Typography>
    </InfoCard>
  );
};
