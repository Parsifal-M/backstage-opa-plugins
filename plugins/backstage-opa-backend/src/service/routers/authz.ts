import { Router } from 'express';
import { Config } from '@backstage/config';
import {
  HttpAuthService,
  LoggerService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';

export function authzRouter(
  logger: LoggerService,
  config: Config,
  httpAuth: HttpAuthService,
  userInfo: UserInfoService,
): Router {
  const router = Router();
  const baseUrl =
    config.getOptionalString('opaClient.baseUrl') ?? 'http://localhost:8181';

  router.post('/opa-authz', async (req, res) => {
    const { input, entryPoint } = req.body;
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const info = await userInfo.getUserInfo(credentials);

    const inputWithCredentials = { ...input, ...info };

    logger.debug(
      `OPA Backend received request with input: ${JSON.stringify(
        input,
      )} and entryPoint: ${entryPoint}`,
    );

    if (!input || !entryPoint) {
      return res
        .status(400)
        .json({ error: 'Missing input or entryPoint in request body' });
    }

    try {
      const url = `${baseUrl}/v1/data/${entryPoint}`;
      logger.debug(
        `Sending data to OPA: ${JSON.stringify(inputWithCredentials)}`,
      );

      const opaResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputWithCredentials }),
      });

      if (!opaResponse.ok) {
        const message = `An error response was returned after sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`;
        logger.error(message);
        return res.status(opaResponse.status).json({ error: message });
      }

      const opaPermissionsResponse = await opaResponse.json();
      logger.debug(
        `Received data from OPA: ${JSON.stringify(opaPermissionsResponse)}`,
      );

      return res.json(opaPermissionsResponse);
    } catch (error: unknown) {
      logger.error(
        `An error occurred while sending the policy input to the OPA server: ${error}`,
      );
      return res.status(500).json({ error: 'Error evaluating policy' });
    }
  });

  router.get('/get-opa-permission-policies', async (_req, res) => {
    try {
      const url = `${baseUrl}/v1/policies`;
      logger.debug(`Fetching policies from OPA`);

      const opaResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!opaResponse.ok) {
        const message = `An error response was returned after fetching policies from the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`;
        logger.error(message);
        return res.status(opaResponse.status).json({ error: message });
      }

      const opaPoliciesResponse = await opaResponse.json();
      logger.debug(
        `Received policies from OPA: ${JSON.stringify(opaPoliciesResponse)}`,
      );

      return res.json(opaPoliciesResponse);
    } catch (error: unknown) {
      logger.error(
        `An error occurred while fetching policies from the OPA server: ${error}`,
      );
      return res.status(500).json({ error: 'Error fetching policies' });
    }
  });

  return router;
}
