import { Router } from 'express';
import { Config } from '@backstage/config';
import { HttpAuthService, LoggerService, UserInfoService } from '@backstage/backend-plugin-api';
import { OpaAuthzClient } from '@parsifal-m/backstage-opa-authz';

export function authzRouter(logger: LoggerService, config: Config, httpAuth: HttpAuthService, userInfo: UserInfoService): Router {
  const router = Router();
  const opaClient = new OpaAuthzClient(logger, config);

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
      res
        .status(400)
        .json({ error: 'Missing input or entryPoint in request body' });
    }

    try {
      console.log(`Input is: ${JSON.stringify(inputWithCredentials)}`);
      const result = await opaClient.evaluatePolicy(inputWithCredentials, entryPoint);
      res.json(result);
    } catch (error) {
      logger.error(`Error evaluating policy: ${error}`);
      res.status(500).json({ error: 'Error evaluating policy' });
    }
  });

  return router;
}
