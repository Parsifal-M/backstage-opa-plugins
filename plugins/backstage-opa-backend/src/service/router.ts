import express from 'express';
import Router from 'express-promise-router';
import {
  HttpAuthService,
  LoggerService,
  UrlReaderService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { entityCheckerRouter } from './routers/entityChecker';
import { policyContentRouter } from './routers/policyContent';
import { authzRouter } from './routers/authz';
import { Config } from '@backstage/config';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { EntityCheckerApi } from '../api/EntityCheckerApi';

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  urlReader: UrlReaderService;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  opaEntityChecker: EntityCheckerApi;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, urlReader, httpAuth, userInfo, opaEntityChecker } =
    options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  if (
    config.getOptionalString('opaClient.policies.entityChecker.entrypoint') &&
    config.getOptionalString('opaClient.baseUrl')
  ) {
    router.use(entityCheckerRouter(logger, opaEntityChecker));
  }
  router.use(authzRouter(logger, config, httpAuth, userInfo));
  router.use(policyContentRouter(logger, urlReader));

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
