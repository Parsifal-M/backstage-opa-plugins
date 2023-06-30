import { OpaBackendApi } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';

export class MyPluginBackendClient implements OpaBackendApi {
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
  async getHealth(): Promise<{ status: string; }> {
    const url = `${await this.discoveryApi.getBaseUrl('opa')}/health`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return await this.handleResponse(response);
  }
}





// import axios from 'axios';
// import { Entity } from '@backstage/catalog-model';

// export async function evaluateMetadata(entityMetadata: Entity): Promise<any> {

//     try {
//       const response = await axios.post(`http://localhost:7007/api/proxy/entity-checker`, {
//           input: entityMetadata,
//       });

//       return response.data.result;
//   } catch (error) {
//     console.error(error); 
//       throw new Error('Failed to evaluate metadata with OPA');
//   }
// }