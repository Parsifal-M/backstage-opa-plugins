import { Entity } from '@backstage/catalog-model';
import { OpaBackendApi, OpaResult } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';

export class OpaBackendClient implements OpaBackendApi {
  private readonly discoveryApi: DiscoveryApi;
  constructor(options: {
    discoveryApi: DiscoveryApi;
  }) {
    this.discoveryApi = options.discoveryApi;
  }
  private async handleResponse(response: Response): Promise<OpaResult> {
    if (!response.ok) {
      throw new Error();
    }
    const data = await response.json();
    if (data.result) {
      return data.result as OpaResult;
    } else {
      throw new Error('Unexpected response data format');
    }
}

async entityCheck(entityMetadata: Entity): Promise<OpaResult> {
  const url = `${await this.discoveryApi.getBaseUrl('opa')}/entity-checker`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: entityMetadata }),
  });
  return await this.handleResponse(response);
}


}