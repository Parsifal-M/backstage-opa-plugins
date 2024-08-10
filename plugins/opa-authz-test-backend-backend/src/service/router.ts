import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { OpaClient, PermissionInput } from '@internal/opa-authz';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export interface OpaResponse {
  [key: string]: unknown;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  const opaClient = new OpaClient(config, logger);

  // Middleware to evaluate policy using OpaClient
  router.use(async (req, res, next) => {
    try {
      console.log(`Request method: ${req.method}`);

      const input: PermissionInput = {
        entryPoint: 'authz/allow',
        request: {
          path: req.path,
          method: req.method,
          headers: req.headers,
          body: req.body,
        },
      };

      console.log('Constructed PermissionInput:', input);

      const opaResponse: OpaResponse = await opaClient.evaluatePolicy(input);

      console.log('OPA Response:', opaResponse);

      // Check the OPA response and decide whether to allow the request
      if (opaResponse.result) {
        console.log('OPA evaluation passed, allowing request.');
        next(); // Allow the request to proceed
      } else {
        console.log('OPA evaluation failed, blocking request.');
        res.status(403).json({ error: 'Forbidden' }); // Block the request
      }
    } catch (error) {
      console.error(`OPA evaluation failed: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/status', (_, response) => {
    logger.info('STATUS CHECK!');
    response.json({ status: 'running' });
  });

  router.get('/info', (_, response) => {
    logger.info('INFO CHECK!');
    response.json({ info: 'This is some info' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}