import express from 'express';
import fetch from 'node-fetch';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

export const entityCheckerRouter = (logger: LoggerService, config: Config): express.Router => {
  const router = express.Router();

  // Get the config options for the OPA plugin
  const opaBaseUrl = config.getOptionalString('opaClient.baseUrl');

  // This is the Entity Checker package
  const entityCheckerEntrypoint = config.getOptionalString(
    'opaClient.policies.entityChecker.entrypoint',
  );

  router.post('/entity-checker', async (req, res, next) => {
    const entityMetadata = req.body.input;

    if (!opaBaseUrl) {
      logger.error('OPA URL not set or missing!');
    }

    const opaUrl = `${opaBaseUrl}/v1/data/${entityCheckerEntrypoint}`;

    if (!entityCheckerEntrypoint) {
      logger.error('OPA package not set or missing!');
    }

    if (!entityMetadata) {
      logger.error('Entity metadata is missing!');
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

  return router;
};