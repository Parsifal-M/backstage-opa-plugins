import React, { useEffect, useState, useCallback } from 'react';
import {
  Grid,
  makeStyles,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Box,
} from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { getRunners } from '../../api/fetchRunners';
import { Runners, Runner } from '../../types';
import { RunnerCard } from '../RunnerCardComponent/RunnerCard';

const useStyles = makeStyles({
  gridContainer: {
    alignItems: 'flex-start',
  },
  sectionHeader: {
    margin: '20px 0',
  },
  online: {
    color: 'green',
  },
  offline: {
    color: 'red',
  },
  stale: {
    color: 'orange',
  },
});

const runnerStatus = ['online', 'offline', 'stale'];

export const RunnerPage = () => {
  const classes = useStyles();
  const [state, setState] = useState<{
    runners: Runners | null;
    loading: boolean;
    error: string | null;
  }>({ runners: null, loading: false, error: null });
  const [tabValue, setTabValue] = useState(0);

  const fetchRunners = useCallback((status: string) => {
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    getRunners(status)
      .then(data => {
        setState({ runners: data, loading: false, error: null });
      })
      .catch(error => {
        setState({ runners: null, loading: false, error: error.message });
      });
  }, []);

  useEffect(() => {
    fetchRunners(runnerStatus[tabValue]);
  }, [tabValue, fetchRunners]);

  const handleChange = (_: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  let content;

  if (state.loading) {
    content = (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  } else if (state.error) {
    content = (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <Typography variant="h6" color="error">
          {state.error}
        </Typography>
      </Box>
    );
  } else {
    content = (
      <Grid container spacing={3} className={classes.gridContainer}>
        {state.runners?.map((runner: Runner) => (
          <Grid item xs={12} sm={6} md={4} key={runner.id}>
            <RunnerCard runner={runner} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Page themeId="tool">
      <Header title="GitLab Runners" subtitle="Overview of all GitLab runners">
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="">
          <SupportButton>Overview of all GitLab runners.</SupportButton>
        </ContentHeader>
        <Tabs value={tabValue} onChange={handleChange}>
          <Tab label="Online" />
          <Tab label="Offline" />
          <Tab label="Stale" />
        </Tabs>
        <Typography variant="h6" className={classes.sectionHeader}>
          <span
            className={
              classes[runnerStatus[tabValue] as 'online' | 'offline' | 'stale']
            }
          >
            {runnerStatus[tabValue].charAt(0).toUpperCase() +
              runnerStatus[tabValue].slice(1)}
          </span>{' '}
          Runners
        </Typography>
        {content}
      </Content>
    </Page>
  );
};
