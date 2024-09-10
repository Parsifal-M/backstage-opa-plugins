import express from 'express';
import Router from 'express-promise-router';
import {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  UrlReaderService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';
import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { readPolicyFile } from '../lib/read';
import {
  OpaClient,
  opaMiddleware,
  PermissionInput,
} from '@parsifal-m/plugin-permission-backend-module-opa-wrapper';

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  urlReader: UrlReaderService;
  auth?: AuthService;
  httpAuth?: HttpAuthService;
  userInfo: UserInfoService;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, urlReader, httpAuth, userInfo } = options;

  const router = Router();
  router.use(express.json());

  const opaClient = new OpaClient(config, logger);
  const entryPoint = 'authz';
  // Optional config to enable the OPA middleware (should be disabled by default)
  const useOpaMiddleware = config.getOptionalBoolean(
    'opaClient.useOpaMiddleware',
  );

  // If the OPA middleware is enabled, use it for all routes in this plugin
  if (useOpaMiddleware) {
    router.use(async (req, res, next) => {
      try {
        const credentials = await httpAuth!.credentials(req);

        const info = await userInfo.getUserInfo(credentials);
        const input: PermissionInput = {
          info,
          resource: req.path,
          method: req.method,
        };

        opaMiddleware(opaClient, entryPoint, input, logger)(req, res, next);
      } catch (error) {
        logger.error('Failed to extract user credentials:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  }

  // Get the config options for the OPA plugin
  const opaBaseUrl = config.getOptionalString('opaClient.baseUrl');

  // This is the Entity Checker package
  const entityCheckerEntrypoint = config.getOptionalString(
    'opaClient.policies.entityChecker.entrypoint',
  );

  router.get('/health', (_, resp) => {
    resp.json({ status: 'ok' });
  });

  router.post('/entity-checker', async (req, res, next) => {
    const entityMetadata = req.body.input;

    if (!opaBaseUrl) {
      logger.error('OPA URL not set or missing!');
      throw new Error('OPA URL not set or missing!');
    }

    const opaUrl = `${opaBaseUrl}/v1/data/${entityCheckerEntrypoint}`;

    if (!entityCheckerEntrypoint) {
      logger.error('OPA package not set or missing!');
      throw new Error('OPA package not set or missing!');
    }

    if (!entityMetadata) {
      logger.error('Entity metadata is missing!');
      throw new Error('Entity metadata is missing!');
    }

    try {
      logger.debug(`Sending entity metadata to OPA: ${entityMetadata}`);
      const opaResponse = await fetch(opaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: entityMetadata }),
      });
      const opaEntityCheckerResponse = await opaResponse.json();
      logger.debug(`Received response from OPA: ${opaEntityCheckerResponse}`);
      return res.json(opaEntityCheckerResponse);
    } catch (error) {
      logger.error(
        'An error occurred trying to send entity metadata to OPA:',
        error,
      );
      return next(error);
    }
  });

  router.get('/get-policy', async (req, res, next) => {
    const opaPolicy = req.query.opaPolicy as string;

    if (!opaPolicy) {
      logger.error(
        'No OPA policy provided!, please check the open-policy-agent/policy annotation and provide a URL to the policy file',
      );
      throw new Error(
        'No OPA policy provided!, please check the open-policy-agent/policy annotation and provide a URL to the policy file',
      );
    }

    try {
      // Fetch the content of the policy file
      logger.debug(`Fetching policy file from ${opaPolicy}`);
      const policyContent = await readPolicyFile(urlReader, opaPolicy);

      return res.json({ policyContent });
    } catch (error) {
      logger.error('An error occurred trying to fetch the policy file:', error);
      return next(error);
    }
  });

  router.use(errorHandler());
  return router;
}
