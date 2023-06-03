import {
  DiscoveryApi,
  ConfigApi,
  createApiRef,
} from '@backstage/core-plugin-api';
import { ArtifactResponse } from '../types';
import { JfrogArtifactoryApiV1, Options } from './types';
import { Logger } from 'winston';

const DEFAULT_PROXY_PATH = '/jfrog-artifactory/api';

export const jfrogArtifactoryApiRef = createApiRef<JfrogArtifactoryApiV1>({
  id: 'plugin.jfrog-artifactory.service',
});

export class JfrogArtifactoryApiClient implements JfrogArtifactoryApiV1 {
  private readonly discoveryApi: DiscoveryApi;
  private readonly configApi: ConfigApi;
  private readonly logger: Logger;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
    this.logger = options.logger;
  }

  private async getBaseUrl() {
    const proxyPath =
      this.configApi.getOptionalString('jfrogArtifactory.proxyPath') ||
      DEFAULT_PROXY_PATH;
    return `${await this.discoveryApi.getBaseUrl('proxy')}${proxyPath}`;
  }

  private async fetcher(url: string, query: string) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: query,
    });
    if (!response.ok) {
      this.logger.error(
        `Failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
      throw new Error(
        `Failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return await response.json();
  }

  async getArtifact(repo: string) {
    try {
      const proxyUrl = await this.getBaseUrl();
      const packageQuery = {
        query:
          'query ($filter: PackageFilter!, $orderBy: PackageOrder) { packages (filter: $filter, orderBy: $orderBy) { edges { node { name, description, created, versions { name, size, package { packageType } vulnerabilities { high, medium, low, info, unknown, skipped } stats { downloadCount } } } } } }',
        variables: {
          filter: {
            name: `*/${repo}`,
          },
          orderBy: {
            field: 'NAME',
            direction: 'DESC',
          },
        },
      };

      return (await this.fetcher(
        `${proxyUrl}/metadata/api/v1/query`,
        JSON.stringify(packageQuery),
      )) as ArtifactResponse;
    } catch (error) {
      this.logger.error(`Failed to retrieve artifact: ${error}`);
      throw error;
    }
  }
}
