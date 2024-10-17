import express from 'express';
import Router from 'express-promise-router';
import {
  DiscoveryService,
  LoggerService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import { entityCheckerRouter } from './routers/entityChecker';
import { policyCheckerRouter } from './routers/policyContent';
import { authzRouter } from './routers/authz';
import { Config } from '@backstage/config';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  urlReader: UrlReaderService;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, urlReader } = options;

  const router = Router();
  router.use(express.json());

  router.use(entityCheckerRouter(logger, config));
  router.use(authzRouter(logger, config));
  router.use(policyCheckerRouter(logger, urlReader));

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
