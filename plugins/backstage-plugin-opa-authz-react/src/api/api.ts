import { ApiRef, createApiRef, FetchApi } from '@backstage/core-plugin-api';
import { OpaAuthzApi, PolicyInput, PolicyResult } from './types';

export const opaAuthzBackendApiRef: ApiRef<OpaAuthzApi> =
  createApiRef<OpaAuthzApi>({
    id: 'plugin.opa-authz.api',
  });

export class OpaAuthzClientReact implements OpaAuthzApi {
  private readonly fetchApi: FetchApi;
  constructor(options: { fetchApi: FetchApi }) {
    this.fetchApi = options.fetchApi;
  }

  async evalPolicy(
    input: PolicyInput,
    entryPoint: string,
  ): Promise<PolicyResult> {
    const url = `plugin://opa/opa-authz`;

    const response = await this.fetchApi.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, entryPoint }),
    });

    if (!response.ok) {
      try {
        throw new Error(`${response.status} ${response.statusText}`);
      } catch (error) {
        throw new Error(error);
      }
    }
    return response.json();
  }
}
