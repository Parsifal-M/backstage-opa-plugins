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
  const opaAddr = config.getOptionalString('opaClient.baseUrl');

  // Get Packages
  // This is the Entity Checker package
  const entityCheckerPackage = config.getOptionalString(
    'opa-client.opa.policies.entityChecker.package',
  );

  const packageName = config.getOptionalString('opaClient.policies.catalogPermission.package');

  router.get('/health', (_, resp) => {
    resp.json({ status: 'ok' });
  });

  router.post('/entity-checker', async (req, res) => {
    const entityMetadata = req.body.input;
    const opaUrl = `${opaAddr}/v1/data/${entityCheckerPackage}`;

    try {
      const opaResponse = await axios.post(opaUrl, {
        input: entityMetadata,
      });

      res.json(opaResponse.data.result);
    } catch (error) {
      logger.error('Failed to evaluate entity metadata with OPA:', error);
      res.status(500).send('Failed to evaluate metadata with OPA');
    }
  });

  router.post('/opa-permissions', async (req, res) => {
    const policyInput = req.body.policyInput;
    const opaUrl = `${opaAddr}/v1/data/${packageName}`;

    try {
      const opaResponse = await axios.post(opaUrl, {
        input: policyInput,
      });
      logger.info(`Sending input to OPA: ${JSON.stringify(policyInput)}`);
      res.json(opaResponse.data.result);
    } catch (error) {
      logger.error('Failed to evaluate permission data with OPA:', error);
      res.status(500).send('Failed to evaluate permission data with OPA');
    }
  });

  router.use(errorHandler());
  return router;
}
