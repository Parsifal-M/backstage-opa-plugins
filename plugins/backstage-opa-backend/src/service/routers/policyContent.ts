import express from 'express';
import { LoggerService, UrlReaderService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { readPolicyFile } from '../../lib/read';

export type PolicyCheckerRouterOptions = {
  logger: LoggerService;
  config: Config;
  urlReader: UrlReaderService;
};

export const policyCheckerRouter = (options: PolicyCheckerRouterOptions): express.Router => {
  const { logger, urlReader } = options;
  const router = express.Router();

  router.get('/get-policy', async (req, res, next) => {
    const opaPolicy = req.query.opaPolicy as string;

    if (!opaPolicy) {
      logger.error(
        'No OPA policy provided! Please check the open-policy-agent/policy annotation and provide a URL to the policy file.',
      );
      return next(new Error(
        'No OPA policy provided! Please check the open-policy-agent/policy annotation and provide a URL to the policy file.',
      ));
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