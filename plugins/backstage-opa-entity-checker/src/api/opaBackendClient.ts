import { Entity } from '@backstage/catalog-model';
import { OpaBackendApi, OpaResult } from './types';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';

export class OpaBackendClient implements OpaBackendApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;
  constructor(options: { discoveryApi: DiscoveryApi, identityApi: IdentityApi}) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
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
    const url = `${await this.discoveryApi.getBaseUrl('opa')}/entity-checker`;
    const { token: idToken } = await this.identityApi.getCredentials();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify({ input: entityMetadata }),
    });
    return await this.handleResponse(response);
  }
}
