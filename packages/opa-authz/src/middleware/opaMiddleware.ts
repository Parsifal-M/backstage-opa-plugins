import { Request, Response, NextFunction } from 'express';
import { PolicyInput } from '../types';
import { LoggerService } from '@backstage/backend-plugin-api';
import { OpaAuthzClient } from '../api';

/**
 * Middleware function that performs authorization using OPA (Open Policy Agent).
 *
 * @param opaClient - The OPA client used to evaluate the policy.
 * @param entryPoint - The entry point for the policy evaluation.
 * @param input - The input data for the policy evaluation.
 * @param logger - The logger service used for logging debug information.
 * @returns A middleware function that handles the authorization process.
 */
export const opaMiddleware = (
  opaClient: OpaAuthzClient,
  entryPoint: string,
  input: PolicyInput,
  logger?: LoggerService,
) => {
  return async (_: Request, res: Response, next: NextFunction) => {
    try {
      if (logger) {
        logger.error(`Sending input to OPA: ${JSON.stringify(input)}`);
      }
      const opaResponse = await opaClient.evaluatePolicy(input, entryPoint);
      if (logger) {
        logger.error(`OPA Response: ${JSON.stringify(opaResponse)}`);
      }
      // Check the OPA response and decide whether to allow the request
      if (opaResponse.result.allow) {
        next(); // Allow the request to proceed
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
