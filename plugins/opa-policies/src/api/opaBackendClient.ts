import { OpaPolicy, OpaPolicyBackendApi } from './types';
import { FetchApi } from '@backstage/core-plugin-api';

export class OpaPolicyBackendClient implements OpaPolicyBackendApi {
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
