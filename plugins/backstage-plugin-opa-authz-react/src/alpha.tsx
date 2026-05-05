import { ApiBlueprint, fetchApiRef } from '@backstage/frontend-plugin-api';
import { opaAuthzBackendApiRef, OpaAuthzClientReact } from './api';

export { RequireOpaAuthz } from './components/OpaAuthzComponent';
export { useOpaAuthz, useOpaAuthzManual } from './hooks/useOpaAuthz';
export { opaAuthzBackendApiRef, OpaAuthzClientReact } from './api';

export const opaAuthzApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: opaAuthzBackendApiRef,
      deps: { fetchApi: fetchApiRef },
      factory: ({ fetchApi }) => new OpaAuthzClientReact({ fetchApi }),
    }),
});
