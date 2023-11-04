import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import axios from 'axios';
import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';

export type RouterOptions = {
  logger: Logger;
  config: Config;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const { config } = options;

  const router = Router();
  router.use(express.json());

  // Get the config options for the OPA plugin
  const opaBaseUrl = config.getOptionalString('opaClient.baseUrl');

  // Get Packages
  // This is the Entity Checker package
  const entityCheckerPackage = config.getOptionalString(
    'opaClient.policies.entityChecker.package',
  );

  // This is the OPA Permissions/RBAC package
  const opaRbacPackage = config.getOptionalString(
    'opaClient.policies.rbac.package',
  );

  router.get('/health', (_, resp) => {
    resp.json({ status: 'ok' });
  });

  router.post('/entity-checker', async (req, res, next) => {
    const entityMetadata = req.body.input;
    const opaUrl = `${opaBaseUrl}/v1/data/${entityCheckerPackage}`;

    if (!opaUrl) {
      return next(new Error('OPA URL not set or missing!'));
    }

    if (!entityMetadata) {
      return next(new Error('Entity metadata is missing!'));
    }

    try {
      const opaResponse = await axios.post(opaUrl, {
        input: entityMetadata,
      });
      return res.json(opaResponse.data.result);
    } catch (error) {
      res.status(500);
      return next(error);
    }
  });

  router.post('/opa-permissions', async (req, res, next) => {
    const policyInput = req.body.policyInput;
    const opaUrl = `${opaBaseUrl}/v1/data/${opaRbacPackage}`;

    if (!opaUrl) {
      res.status(400);
      logger.error('OPA URL not set or missing!');
      return next(new Error('OPA URL not set or missing!'));
    }

    if (!opaRbacPackage) {
      res.status(400);
      logger.error('OPA package not set or missing!');
      return next(new Error('OPA package not set or missing!'));
    }

    if (!policyInput) {
      res.status(400);
      logger.error('Policy input is missing!');
      return next(new Error('Policy input is missing!'));
    }

    try {
      const opaResponse = await axios.post(opaUrl, {
        input: policyInput,
      });
      logger.info(
        `Permission request sent to OPA with input: ${JSON.stringify(
          policyInput,
        )}`,
      );
      return res.json(opaResponse.data.result);
    } catch (error) {
      res.status(500);
      logger.error('Error during OPA policy evaluation:', error);
      return next(error);
    }
  });

  router.use(errorHandler());
  return router;
}
