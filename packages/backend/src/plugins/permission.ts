import { createRouter } from '@backstage/plugin-permission-backend';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { PermissionPolicy, PolicyQuery } from '@backstage/plugin-permission-node';
import { OpaClient } from '../opa/opaClient';

class TestPermissionPolicy implements PermissionPolicy {
  private readonly opaClient: OpaClient;

  constructor(opaClient: OpaClient) {
    this.opaClient = opaClient;
  }

  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    if (request.permission.name !== 'catalog.entity.delete') {
      return { result: AuthorizeResult.ALLOW };
    }

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

    const result = await this.opaClient.evaluatePolicy(input);

    return { result: result ? AuthorizeResult.DENY : AuthorizeResult.ALLOW };
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
