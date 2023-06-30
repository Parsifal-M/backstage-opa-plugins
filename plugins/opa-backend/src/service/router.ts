import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import axios from 'axios';
import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const { config } = options;

  const router = Router();
  router.use(express.json());

  router.post('/entity-checker', async (request, response) => {
    const entityMetadata = request.body.input;
    const packageName = config.getString(
      'opa-client.opa.policies.entityChecker.package',
    );
    logger.warn(`Package name: ${packageName}`);
    const opaUrl = `http://localhost:8181/v1/data/${packageName}/`;

    try {
      const opaResponse = await axios.post(opaUrl, {
        input: entityMetadata,
      });

      response.json(opaResponse.data.result);
    } catch (error) {
      logger.error('Failed to evaluate metadata with OPA', error);
      response.status(500).send('Failed to evaluate metadata with OPA');
    }
  });

  router.use(errorHandler());
  return router;
}
