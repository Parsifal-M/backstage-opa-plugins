import { OpaBackendApi } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';

export class OpaBackendClient implements OpaBackendApi {
  private readonly discoveryApi: DiscoveryApi;
  constructor(options: {
    discoveryApi: DiscoveryApi;
  }) {
    this.discoveryApi = options.discoveryApi;
  }
  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      throw new Error();
    }
    return await response.json();
  }
  async entityCheck(): Promise<{ status: string; }> {
    const url = `${await this.discoveryApi.getBaseUrl('opa')}/entity-checker`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return await this.handleResponse(response);
  }
}