import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { PolicyList } from '../PolicyList';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

type OpaPermissionsPageProps = {
  title?: string;
  subtitle?: string;
  owner?: string;
  supportButtonTitle?: string;
  supportButtonText?: string;
};

export const OpaPermissionsPage = ({
  title,
  subtitle,
  owner,
  supportButtonTitle,
  supportButtonText,
}: OpaPermissionsPageProps) => {
  const configApi = useApi(configApiRef);
  const appName = configApi.getString('app.title') ?? 'Backstage';

  return (
    <Page themeId="tool">
      <Header
        title={title || 'OPA Permissions Frontend'}
        subtitle={subtitle || 'Manage permissions for your Backstage instance'}
      >
        <HeaderLabel label="Owner" value={owner || 'Backstage Admin Team'} />
      </Header>
      <Content>
        <ContentHeader title="">
          <SupportButton title={supportButtonTitle || ''}>
            {supportButtonText || 'Get Support'}
          </SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <InfoCard title="Policy and Permissions Management">
              <Typography variant="body1">
                This plugin provides a frontend for managing policies and
                permissions in your {appName} instance.
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item>
            <PolicyList />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
