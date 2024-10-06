import { Request, Response, NextFunction } from 'express';
import { PolicyInput } from '../types';
import { LoggerService } from '@backstage/backend-plugin-api';
import { OpaAuthzClient } from '../api';

/**
 * Middleware function for authorization using Open Policy Agent (OPA).
 *
 * This middleware function evaluates a policy using OPA and determines whether
 * the request should be allowed or denied based on the policy evaluation result.
 *
 * @param opaClient - An instance of the OPA client used to evaluate the policy.
 * @param entryPoint - The entry point (path) for the policy evaluation within OPA.
 * @param input - The input data provided to the policy for evaluation.
 * @param logger - An optional logger service for logging debug information.
 * @param customErrorMessage - An optional custom error message to return when access is forbidden.
 * @returns A middleware function that handles the authorization process.
 *
 */
export const opaAuthzMiddleware = (
  opaClient: OpaAuthzClient,
  entryPoint: string,
  input: PolicyInput,
  logger?: LoggerService,
  customErrorMessage?: string,
) => {
  return async (_: Request, res: Response, next: NextFunction) => {
    try {
      if (logger) {
        logger.debug(
          `OPA middleware sending input to OPA: ${JSON.stringify(input)}`,
        );
      }
      const opaResponse = await opaClient.evaluatePolicy(input, entryPoint);
      if (logger) {
        logger.debug(`OPA middleware response: ${JSON.stringify(opaResponse)}`);
      }
      if (opaResponse.result.allow) {
        next();
      } else {
        res.status(403).json({ error: customErrorMessage ?? 'Forbidden' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
