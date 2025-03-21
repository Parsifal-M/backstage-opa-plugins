import { OpaPolicy, OpaBackendApi } from './types';
import { createApiRef, FetchApi } from '@backstage/core-plugin-api';

export const opaApiRef = createApiRef<OpaBackendApi>({
  id: 'plugin.opa-policies-viewer.service',
});

export class OpaClient implements OpaBackendApi {
  private readonly fetchApi: FetchApi;
  constructor(options: { fetchApi: FetchApi }) {
    this.fetchApi = options.fetchApi;
  }

  async getPolicyFromRepo(opaPolicy: string): Promise<OpaPolicy> {
    const url = `plugin://opa/get-policy?opaPolicy=${encodeURIComponent(
      opaPolicy,
    )}`;

    const response = await this.fetchApi.fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const message = `Error ${response.status}: ${response.statusText}.`;

      try {
        const responseBody = await response.json();
        throw new Error(
          `${message} Details: ${
            responseBody.error || 'No additional details provided.'
          }`,
        );
      } catch (error) {
        throw new Error(message);
      }
    }

    const data = await response.json();
    return data as OpaPolicy;
  }
}
