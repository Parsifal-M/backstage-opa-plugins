import axios from 'axios';
import { Entity } from '@backstage/catalog-model';
import { ConfigApi, DiscoveryApi } from '@backstage/core-plugin-api';

// export async function evaluateMetadata(entityMetadata: Entity): Promise<any> {
//     const opaURL = 'http://localhost:7007/api/proxy/opa/';

//     try {
//       const response = await axios.post(opaURL, {
//           input: entityMetadata,
//       });

//       return response.data.result;
//   } catch (error) {
//       throw new Error('Failed to evaluate metadata with OPA');
//   }
// }

const DEFAULT_PROXY_PATH = '/opa/entity-checker';

export type Options = {
    discoveryApiUrl: DiscoveryApi;
    configApi: ConfigApi;
};

export class OpaClient {
    private readonly discoveryApiUrl: DiscoveryApi;
    private readonly configApi: ConfigApi;

    constructor(options: Options) {
        this.discoveryApiUrl = options.discoveryApiUrl;
        this.configApi = options.configApi;
    }

    async evaluateMetadata(entityMetadata: Entity): Promise<any> {
        const proxyPath = this.configApi.getOptionalString(
            'proxy.opaEntityChecker.proxyPath',
        ) || DEFAULT_PROXY_PATH;

        const opaURL = await this.discoveryApiUrl.getBaseUrl('proxy') + proxyPath;

        try {
            const response = await axios.post(opaURL, {
                input: entityMetadata,
            });

            return response.data.result;
        } catch (error) {
            throw new Error('Failed to evaluate metadata with OPA');
        }
    }
}