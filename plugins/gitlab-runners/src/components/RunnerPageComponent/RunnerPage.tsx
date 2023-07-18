// RunnerPage.tsx
import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { Header, Page, Content, ContentHeader, HeaderLabel, SupportButton } from '@backstage/core-components';
import { getRunners } from '../../api/fetchRunners';
import { Runners } from '../../types';
import { RunnerCard } from '../RunnerCardComponent/RunnerCard';


export const RunnerPage = () => {
  const [runners, setRunners] = useState<Runners | null>(null);

  useEffect(() => {
    getRunners()
      .then(data => setRunners(data))
  }, []);

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
        <Grid container spacing={3}>
          {runners && runners.map((runner) => (
            <Grid item xs={12} sm={6} md={4} key={runner.id}>
              <RunnerCard runner={runner} />
            </Grid>
          ))}
        </Grid>
      </Content>
    </Page>
  );
};

