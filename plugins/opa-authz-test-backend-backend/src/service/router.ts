import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { OpaClient, PermissionInput, opaMiddleware } from '@parsifal-m/plugin-permission-backend-module-opa-wrapper';
import express from 'express';
import Router from 'express-promise-router';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  const opaClient = new OpaClient(config, logger);

  const permissionInput: PermissionInput = {
    request: {
      hello: 'world',
    },
    date: new Date().toISOString(),
  };

  // Use the OPA middleware for all routes
  router.use(opaMiddleware(opaClient, permissionInput, logger));

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/status', (_, response) => {
    logger.info('STATUS CHECK!');
    response.json({ status: 'running' });
  });

  router.get('/info', (_, response) => {
    logger.info('INFO CHECK!');
    response.json({ info: 'This is some info' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
