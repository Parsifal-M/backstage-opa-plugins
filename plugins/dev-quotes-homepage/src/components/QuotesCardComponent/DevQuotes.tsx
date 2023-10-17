import { Typography } from '@material-ui/core';
import React from 'react';
import { quotes } from '../../quotes';

export const DevQuote = () => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <>
      <Typography variant="h6">{randomQuote.text}</Typography>
      <Typography variant="subtitle2">{randomQuote.author}</Typography>
    </>
  );
};
