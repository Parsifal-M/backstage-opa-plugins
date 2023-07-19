// RunnerPage.tsx
import React, { useEffect, useState } from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { Header, Page, Content, ContentHeader, HeaderLabel, SupportButton } from '@backstage/core-components';
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


export const RunnerPage = () => {
  const classes = useStyles();
  const [runners, setRunners] = useState<Runners | null>(null);

  useEffect(() => {
    getRunners()
      .then(data => setRunners(data))
  }, []);

  const onlineRunners = runners?.filter(runner => runner.online) || [];
  const offlineRunners = runners?.filter(runner => !runner.online && runner.status !== 'stale') || [];
  const staleRunners = runners?.filter(runner => runner.status === 'stale') || [];

  return (
    <Page themeId="tool">
      <Header title="GitLab Runners" subtitle="Overview of all GitLab runners">
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="Runners">
          <SupportButton>Overview of all GitLab runners.</SupportButton>
        </ContentHeader>
        <Typography variant="h6" className={classes.sectionHeader}>
          <span className={classes.online}>Online</span> Runners
        </Typography>
        <Grid container spacing={3} className={classes.gridContainer}>
          {onlineRunners.map((runner: Runner) => (
            <Grid item xs={12} sm={6} md={4} key={runner.id}>
              <RunnerCard runner={runner} />
            </Grid>
          ))}
        </Grid>
        <Typography variant="h6" className={classes.sectionHeader}>
          <span className={classes.offline}>Offline</span> Runners
        </Typography>
        <Grid container spacing={3} className={classes.gridContainer}>
          {offlineRunners.map((runner: Runner) => (
            <Grid item xs={12} sm={6} md={4} key={runner.id}>
              <RunnerCard runner={runner} />
            </Grid>
          ))}
        </Grid>
        <Typography variant="h6" className={classes.sectionHeader}>
          <span className={classes.stale}>Stale</span> Runners
        </Typography>
        <Grid container spacing={3} className={classes.gridContainer}>
          {staleRunners.map((runner: Runner) => (
            <Grid item xs={12} sm={6} md={4} key={runner.id}>
              <RunnerCard runner={runner} />
            </Grid>
          ))}
        </Grid>
      </Content>
    </Page>
  );
};
