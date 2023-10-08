/* eslint-disable @backstage/no-relative-monorepo-imports */
import { createRouter } from '@backstage/plugin-permission-backend';
import { Router } from 'express-serve-static-core';
import { PluginEnvironment } from '../types';
import { OpaClient, PermissionsHandler } from '@parsifal-m/opa-permissions-wrapper'

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient(env.config, env.logger);
  const opaPermissionHandler = new PermissionsHandler(opaClient, env.logger);

  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: opaPermissionHandler,
    identity: env.identity,
  });
}
