import { Router } from 'express';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { OpaAuthzClient } from '@parsifal-m/backstage-opa-authz';

export function authzRouter(config: Config, logger: LoggerService): Router {
  const router = Router();
  const opaClient = new OpaAuthzClient(config, logger);

  router.post('/opa-authz', async (req, res) => {
    const { input, entryPoint } = req.body;

    logger.error(`OPA Backend received request with input: ${JSON.stringify(input)} and entryPoint: ${entryPoint}`);

    console.log(`OPA Backend received request with input: ${JSON.stringify(input)} and entryPoint: ${entryPoint}`);

    if (!input || !entryPoint) {
      res.status(400).json({ error: 'Missing input or entryPoint in request body' });
      return;
    }

    try {
      const result = await opaClient.evaluatePolicy(input, entryPoint);
      res.json(result);
    } catch (error) {
      logger.error(`Error evaluating policy: ${error}`);
      res.status(500).json({ error: 'Error evaluating policy' });
    }
  });

  return router;
}