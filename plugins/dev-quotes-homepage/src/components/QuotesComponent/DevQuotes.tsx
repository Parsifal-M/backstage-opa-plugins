import { Typography, makeStyles } from '@material-ui/core';
import React from 'react';
import { quotes } from '../../quotes';

const useStyles = makeStyles(theme => ({
  footer: {
    width: '100%',
    textAlign: 'center',
    padding: theme.spacing(2),
  },
}));

export const DevQuote = () => {
  const classes = useStyles();
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <footer className={classes.footer}>
      <Typography variant="h6">{randomQuote.text}</Typography>
      <Typography variant="subtitle2">{randomQuote.author}</Typography>
    </footer>
  );
};
