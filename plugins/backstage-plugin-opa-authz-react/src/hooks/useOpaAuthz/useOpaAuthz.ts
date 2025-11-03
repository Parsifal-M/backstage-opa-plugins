import { useApi } from '@backstage/core-plugin-api';
import { opaAuthzBackendApiRef } from '../../api';
import { PolicyInput, PolicyResult } from '@parsifal-m/backstage-plugin-opa-common';
import useSWR from 'swr';

export type AsyncOpaAuthzResult = {
  loading: boolean;
  data: PolicyResult | null;
  error?: Error;
};

export function useOpaAuthz(
  input: PolicyInput,
  entryPoint: string,
): AsyncOpaAuthzResult {
  const opaAuthzBackendApi = useApi(opaAuthzBackendApiRef);

  const { data, error } = useSWR(input, async (authzInput: PolicyInput) => {
    return await opaAuthzBackendApi.evalPolicy(authzInput, entryPoint);
  });

  if (error) {
    return { error, loading: false, data: null };
  }

  if (!data?.result) {
    return { loading: true, data: null };
  }

  return { loading: false, data: data };
}
