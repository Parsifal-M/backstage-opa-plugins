import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';
import { Typography, Box, Paper } from '@material-ui/core';
import {
  opaAuthzBackendApiRef,
  OpaAuthzApi,
  RequireOpaAuthz,
  useOpaAuthz,
} from '../src';
import { PolicyResult } from '@parsifal-m/backstage-plugin-opa-common';

// These mocks simulate the response that the OPA backend plugin
// (backstage-opa-backend) would return after evaluating a policy.
// The real client calls plugin://opa/opa-authz → the backend → OPA.
// Here we stub that entire chain at the API boundary so no backend
// or OPA server is needed during component development.
const mockAllow: OpaAuthzApi = {
  async evalPolicy(): Promise<PolicyResult> {
    return { result: { allow: true } };
  },
};

const mockDeny: OpaAuthzApi = {
  async evalPolicy(): Promise<PolicyResult> {
    return { result: { allow: false } };
  },
};

function HookResultDemo() {
  const { loading, data, error } = useOpaAuthz(
    { action: 'view', resource: 'public-data' },
    'opa_authz_react_demo',
  );

  if (loading) return <Typography>Loading...</Typography>;
  if (error)
    return <Typography color="error">Error: {error.message}</Typography>;
  return (
    <Typography>
      Hook result: <code>{JSON.stringify(data?.result)}</code>
    </Typography>
  );
}

function OpaAuthzDemoPage() {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        OPA Authz React — Dev Demo
      </Typography>

      <Paper style={{ padding: 16, marginBottom: 24 }}>
        <Typography variant="h6" gutterBottom>
          RequireOpaAuthz — backend returns allow: true
        </Typography>
        <TestApiProvider apis={[[opaAuthzBackendApiRef, mockAllow]]}>
          <RequireOpaAuthz
            input={{ action: 'view', resource: 'public-data' }}
            entryPoint="opa_authz_react_demo"
          >
            <Typography style={{ color: 'green' }}>
              Content visible — backend returned allow: true
            </Typography>
          </RequireOpaAuthz>
        </TestApiProvider>
      </Paper>

      <Paper style={{ padding: 16, marginBottom: 24 }}>
        <Typography variant="h6" gutterBottom>
          RequireOpaAuthz — backend returns allow: false
        </Typography>
        <TestApiProvider apis={[[opaAuthzBackendApiRef, mockDeny]]}>
          <RequireOpaAuthz
            input={{ action: 'edit', resource: 'public-data' }}
            entryPoint="opa_authz_react_demo"
          >
            <Typography>This should NOT appear</Typography>
          </RequireOpaAuthz>
          <Typography style={{ color: 'darkorange' }}>
            Nothing rendered above — backend returned allow: false (correct)
          </Typography>
        </TestApiProvider>
      </Paper>

      <Paper style={{ padding: 16 }}>
        <Typography variant="h6" gutterBottom>
          useOpaAuthz hook — backend returns allow: true
        </Typography>
        <TestApiProvider apis={[[opaAuthzBackendApiRef, mockAllow]]}>
          <HookResultDemo />
        </TestApiProvider>
      </Paper>
    </Box>
  );
}

createDevApp()
  .addPage({
    element: <OpaAuthzDemoPage />,
    title: 'OPA Authz React',
    path: '/opa-authz',
  })
  .render();
