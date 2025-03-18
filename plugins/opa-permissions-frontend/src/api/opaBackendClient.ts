import { OpaBackendApi, OpaPoliciesResponse } from './types';
import { FetchApi } from '@backstage/core-plugin-api';

export class OpaPermissionsClient implements OpaBackendApi {
  private readonly fetchApi: FetchApi;
  constructor(options: { fetchApi: FetchApi }) {
    this.fetchApi = options.fetchApi;
  }
  private async handleResponse(
    response: Response,
  ): Promise<OpaPoliciesResponse> {
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
    return data as OpaPoliciesResponse;
  }

  async getOpaPermissionPolicies(): Promise<OpaPoliciesResponse> {
    const url = `plugin://opa/get-opa-permission-policies`;
    const response = await this.fetchApi.fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await this.handleResponse(response);
  }
}
