import express from 'express';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { OpaEntityCheckResult } from '../../types';

export const entityCheckerRouter = (
  logger: LoggerService,
  config: Config,
): express.Router => {
  const router = express.Router();

  router.post('/entity-checker', async (req, res, next) => {
    const entityMetadata = req.body.input as Entity;

    if (!entityMetadata) {
      logger.error('Entity metadata is missing!');
      return res.status(400).json({ error: 'Entity metadata is missing!' });
    }

    try {
      const baseUrl = config.getOptionalString('openPolicyAgent.baseUrl');
      const entrypoint = config.getOptionalString(
        'openPolicyAgent.entityChecker.policyEntryPoint',
      );

      if (!baseUrl) {
        logger.error('OPA base URL not configured');
        return res.status(500).json({ error: 'OPA base URL not configured' });
      }

      if (!entrypoint) {
        logger.error(
          'OPA entity checker policyEntryPoint is required, please set it in the configuration',
        );
        return res.status(500).json({
          error:
            'OPA entity checker policyEntryPoint is required, please set it in the configuration',
        });
      }

      const opaUrl = `${baseUrl}/v1/data/${entrypoint}`;
      logger.debug(
        `Sending entity metadata to OPA: ${JSON.stringify(entityMetadata)}`,
      );

      const response = await fetch(opaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: entityMetadata }),
      });

      if (!response.ok) {
        const message = `OPA server returned error: ${response.status} - ${response.statusText}`;
        logger.error(message);
        return res.status(response.status).json({ error: message });
      }

      const opaResponse = (await response.json()) as OpaEntityCheckResult;
      return res.json(opaResponse);
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
