import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import fetch from 'node-fetch';
import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

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

    if (!opaBaseUrl) {
      logger.error('OPA URL not set or missing!');
      throw new InputError('OPA URL not set or missing!');
    }

    const opaUrl = `${opaBaseUrl}/v1/data/${entityCheckerPackage}`;

    if (!entityCheckerPackage) {
      res
        .status(400)
        .json({ message: 'OPA entity checker package not set or missing!' });
      logger.error('OPA package not set or missing!');
      throw new InputError('OPA package not set or missing!');
    }

    if (!entityMetadata) {
      logger.error('Entity metadata is missing!');
      throw new InputError('Entity metadata is missing!');
    }

    try {
      const opaResponse = await fetch(opaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: entityMetadata }),
      });
      const opaEntityCheckerResponse = await opaResponse.json();
      return res.json(opaEntityCheckerResponse);
    } catch (error) {
      logger.error(
        'An error occurred trying to send entity metadata to OPA:',
        error,
      );
      res.status(500).json({
        message: `An error occurred trying to send entity metadata to OPA`,
      });
      return next(error);
    }
  });

  router.post('/opa-permissions', async (req, res, next) => {
    const policyInput = req.body.policyInput;

    if (!opaBaseUrl) {
      res.status(400).json({ message: 'OPA URL not set or missing!' });
      logger.error('OPA URL not set or missing!');
      throw new InputError('OPA URL not set or missing!');
    }

    const opaUrl = `${opaBaseUrl}/v1/data/${opaRbacPackage}`;

    if (!opaRbacPackage) {
      res.status(400).json({ message: 'OPA RBAC package not set or missing!' });
      logger.error('OPA package not set or missing!');
      throw new InputError('OPA package not set or missing!');
    }

    if (!policyInput) {
      res.status(400).json({ message: 'The policy input is missing!' });
      logger.error('Policy input is missing!');
      throw new InputError('Policy input is missing!');
    }

    try {
      const opaResponse = await fetch(opaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: policyInput }),
      });
      logger.info(
        `Permission request sent to OPA with input: ${JSON.stringify(
          policyInput,
        )}`,
      );
      const opaPermissionsResponse = await opaResponse.json();
      return res.json(opaPermissionsResponse.result);
    } catch (error) {
      res.status(500).json({
        message: `An error occurred trying to send policy input to OPA`,
      });
      logger.error(
        'An error occurred trying to send policy input to OPA:',
        error,
      );
      return next(error);
    }
  });

  router.use(errorHandler());
  return router;
}
