import { Card, CardContent, Typography } from '@material-ui/core';
import React from 'react';
import { quotes } from '../../quotes';

export const QuoteCard: React.FC = () => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          {randomQuote.text}
        </Typography>
        <Typography color="textSecondary">{randomQuote.author}</Typography>
      </CardContent>
    </Card>
  );
};
