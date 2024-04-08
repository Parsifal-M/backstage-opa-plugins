import { OpaPolicy, OpaPolicyBackendApi } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';

export class OpaPolicyBackendClient implements OpaPolicyBackendApi {
    private readonly discoveryApi: DiscoveryApi;
    constructor(options: { discoveryApi: DiscoveryApi }) {
        this.discoveryApi = options.discoveryApi;
    }

    async getPolicy(policyId: string): Promise<OpaPolicy> {
        const url = `${await this.discoveryApi.getBaseUrl('opa')}/get-policy/${policyId}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.result as OpaPolicy;
    }
}