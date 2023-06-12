import { DiscoveryApi, ConfigApi } from '@backstage/core-plugin-api';
import { ArtifactResponse } from '../types';

export interface JfrogArtifactoryApiV1 {
  getArtifact(repo: string): Promise<ArtifactResponse>;
}

export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};