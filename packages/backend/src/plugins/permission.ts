import { createRouter } from '@backstage/plugin-permission-backend';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { PermissionPolicy, PolicyQuery } from '@backstage/plugin-permission-node';
// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { OpaClient } from '../../../../plugins/opa-auth-backend/src/opa/opaClient';

class TestPermissionPolicy implements PermissionPolicy {
  private readonly opaClient: OpaClient;

  constructor(opaClient: OpaClient) {
    this.opaClient = opaClient;
  }

  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    console.log('Received request:', request);

    if (request.permission.name === 'catalog.entity.delete') {
      const input = {
        input: {
          resource: {
            kind: 'Component',
            namespace: 'default',
            name: 'my-component',
            path: '/catalog/my-component',
          }
        }
      };
      

      console.log('Input:', input);

      const result = await this.opaClient.evaluatePolicy(input);

      console.log('Result:', result);

      // if (result === true || result === undefined) {
      //   console.log('Result is undefined or null, allowing access');
      //   return { result: AuthorizeResult.ALLOW };
      // }

      return { result: result ? AuthorizeResult.DENY : AuthorizeResult.ALLOW };
    }
    return { result: AuthorizeResult.ALLOW };
  }
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient('http://localhost:8181/v1/data');
  const policy = new TestPermissionPolicy(opaClient);

  return createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy,
    identity: env.identity,
  });
}
