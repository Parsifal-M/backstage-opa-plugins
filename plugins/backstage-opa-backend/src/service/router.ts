import express from 'express';
import Router from 'express-promise-router';
import {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { entityCheckerRouter } from './routers/entityChecker';
import { policyCheckerRouter } from './routers/policyContent';
import { authzRouter } from './routers/authz';

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  urlReader: UrlReaderService;
  auth: AuthService;
  httpAuth: HttpAuthService;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  router.use(entityCheckerRouter(options));
  router.use(policyCheckerRouter(options));
  router.use(authzRouter(config, logger));

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
