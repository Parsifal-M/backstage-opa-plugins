import { useApi } from '@backstage/core-plugin-api';
import { opaAuthzBackendApiRef } from '../../api';
import { PolicyInput, PolicyResult } from '../../api/types';
import useSWR from 'swr';
import { useState, useCallback } from 'react';

export type ManualOpaAuthzResult = {
  loading: boolean;
  data: PolicyResult | null;
  error?: Error;
  evaluatePolicy: () => Promise<PolicyResult | undefined>;
};

export function useOpaAuthzManual(
  input: PolicyInput,
  entryPoint: string,
): ManualOpaAuthzResult {
  const opaAuthzBackendApi = useApi(opaAuthzBackendApiRef);
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data, error, mutate } = useSWR(
    shouldFetch ? input : null,
    async (authzInput: PolicyInput) => {
      return await opaAuthzBackendApi.evalPolicy(authzInput, entryPoint);
    },
  );

  const evaluatePolicy = useCallback(async () => {
    setShouldFetch(true);
    return await mutate();
  }, [mutate]);

  if (error) {
    return { error, loading: false, data: null, evaluatePolicy };
  }

  if (!data?.result) {
    return { loading: true, data: null, evaluatePolicy };
  }

  return { loading: false, data: data, evaluatePolicy };
}
