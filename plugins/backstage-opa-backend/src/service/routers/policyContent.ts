import express from 'express';
import {
  LoggerService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import { readPolicyFile } from '../../lib/read';



export const policyCheckerRouter = (logger: LoggerService, urlReader: UrlReaderService): express.Router => {

  const router = express.Router();

  router.get('/get-policy', async (req, res, next) => {
    const opaPolicy = req.query.opaPolicy as string;

    if (!opaPolicy) {
      logger.error(
        'No OPA policy provided! Please check the open-policy-agent/policy annotation and provide a URL to the policy file.',
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
