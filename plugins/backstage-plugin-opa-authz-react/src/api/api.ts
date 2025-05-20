import { ApiRef, createApiRef, FetchApi, ConfigApi } from '@backstage/core-plugin-api';
import { OpaAuthzApi, PolicyInput, PolicyResult } from './types';

export const opaAuthzBackendApiRef: ApiRef<OpaAuthzApi> =
  createApiRef<OpaAuthzApi>({
    id: 'plugin.opa-authz.api',
  });

export class OpaAuthzClientReact implements OpaAuthzApi {
  private readonly fetchApi: FetchApi;
  private readonly configApi?: ConfigApi;
  constructor(options: { fetchApi: FetchApi, configApi?: ConfigApi }) {
    this.fetchApi = options.fetchApi;
    this.configApi = options.configApi;
  }

  async evalPolicy(
    input: PolicyInput,
    entryPoint: string,
  ): Promise<PolicyResult> {
    const url = this.configApi?.getOptionalString('opaClient.backstageUrl') || `plugin://opa/opa-authz`;

    const response = await this.fetchApi.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, entryPoint }),
    });

    if (!response.ok) {
      const message = `Error ${response.status}: ${response.statusText}.`;

      try {
        const responseBody = await response.json();
        throw new Error(`${message} ${responseBody.error}`);
      } catch (error) {
        throw new Error(message);
      }
    }
    return response.json();
  }
}
