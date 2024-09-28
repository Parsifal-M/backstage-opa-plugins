import express from 'express';
import {
  HttpAuthService,
  LoggerService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { readPolicyFile } from '../../lib/read';
import { OpaAuthzClient, opaMiddleware } from '@parsifal-m/backstage-opa-authz';

export type PolicyCheckerRouterOptions = {
  logger: LoggerService;
  config: Config;
  urlReader: UrlReaderService;
  httpAuth: HttpAuthService;
};

export const policyCheckerRouter = (
  options: PolicyCheckerRouterOptions,
): express.Router => {
  const { logger, urlReader, config, httpAuth } = options;

  // Create the OPA Client
  const opaClient = new OpaAuthzClient(config, logger);
  const router = express.Router();

  router.get('/get-policy', async (req, res, next) => {
    const opaPolicy = req.query.opaPolicy as string;
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });

    console.log('credentials are:', credentials);

    // Set the Policy Input
    const input = {
      user: credentials,
    };

    console.log('input for OPA is:', input);

    // Set the OPA entrypoint
    const entryPoint = 'authz';

    // Use the OPA Middleware on all routes
    if (config.getOptionalBoolean('opaClient.useMiddleware')) {
      router.use(opaMiddleware(opaClient, entryPoint, input));
    }

    if (!opaPolicy) {
      logger.error(
        'No OPA policy provided! Please check the open-policy-agent/policy annotation and provide a URL to the policy file.',
      );
      return next(
        new Error(
          'No OPA policy provided! Please check the open-policy-agent/policy annotation and provide a URL to the policy file.',
        ),
      );
    }

    try {
      // Fetch the content of the policy file
      logger.debug(`Fetching policy file from ${opaPolicy}`);
      const policyContent = await readPolicyFile(urlReader, opaPolicy);

      return res.json({ policyContent });
    } catch (error) {
      logger.error('An error occurred trying to fetch the policy file:', error);
      return next(error);
    }
  });

  return router;
};
