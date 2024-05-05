import { Entity } from '@backstage/catalog-model';
import { OpaBackendApi, OpaResult } from './types';
import { FetchApi } from '@backstage/core-plugin-api';

export class OpaBackendClient implements OpaBackendApi {
  private readonly fetchApi: FetchApi;
  constructor(options: { fetchApi: FetchApi }) {
    this.fetchApi = options.fetchApi;
  }
  private async handleResponse(response: Response): Promise<OpaResult> {
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
    return data as OpaResult;
  }

  async entityCheck(entityMetadata: Entity): Promise<OpaResult> {
    const url = `plugin://opa/entity-checker`;
    const response = await this.fetchApi.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: entityMetadata }),
    });
    return await this.handleResponse(response);
  }
}
