import express from 'express';
import Router from 'express-promise-router';
import {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  UrlReaderService
} from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';
import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { readPolicyFile } from '../lib/read';

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  urlReader: UrlReaderService
  auth?: AuthService;
  httpAuth?: HttpAuthService;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, urlReader } = options;

  const router = Router();
  router.use(express.json());

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
      logger.error('No OPA policy provided!, please check the open-policy-agent/policy annotation');
      throw new Error('No OPA policy provided!, please check the open-policy-agent/policy annotation');
    }
  
    try {
      // Fetch the content of the policy file
      logger.debug(`Fetching policy file from ${opaPolicy}`);
      const policyContent = await readPolicyFile(urlReader, opaPolicy);
  
      return res.json({ policyContent });
  
    } catch (error) {
      logger.error(
        'An error occurred trying to fetch the policy file:',
        error,
      );
      return next(error);
    }
  });

  router.use(errorHandler());
  return router;
}
