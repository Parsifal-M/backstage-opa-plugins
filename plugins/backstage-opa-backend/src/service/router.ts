import express from 'express';
import Router from 'express-promise-router';
import {
  HttpAuthService,
  LoggerService,
  UrlReaderService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { entityCheckerRouter } from './routers/entityChecker';
import { policyViewerRouter } from './routers/policyViewer';
import { authzRouter } from './routers/authz';
import { Config } from '@backstage/config';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  urlReader: UrlReaderService;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, urlReader, httpAuth, userInfo } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const entityCheckerEnabled =
    config.getOptionalBoolean('openPolicyAgent.entityChecker.enabled') ?? false;
  const policyViewerEnabled =
    config.getOptionalBoolean('openPolicyAgent.policyViewer.enabled') ?? false;

  if (entityCheckerEnabled) {
    logger.info('Mounting Entity Checker router');
    router.use(entityCheckerRouter(logger, config));
  }

  if (policyViewerEnabled) {
    logger.info('Mounting Policy Viewer router');
    router.use(policyViewerRouter(logger, urlReader));
  }

  router.use(authzRouter(logger, config, httpAuth, userInfo));

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
