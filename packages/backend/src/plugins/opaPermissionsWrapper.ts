import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { createRouter } from '@parsifal-m/opa-permissions-wrapper';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
  });
}