import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  opaAuthzBackendApiRef,
  OpaAuthzClientReact,
} from '@parsifal-m/backstage-plugin-opa-authz-react';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  createApiFactory({
    api: opaAuthzBackendApiRef,
    deps: {
      fetchApi: fetchApiRef,
    },
    factory: ({ fetchApi }) => new OpaAuthzClientReact({ fetchApi }),
  }),
  ScmAuth.createDefaultApiFactory(),
];
