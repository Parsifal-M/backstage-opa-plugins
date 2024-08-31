import { Request, Response, NextFunction } from 'express';
import { PermissionInput } from '../types';
import { OpaClient } from '../opa-client/opaClient';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * Middleware function that performs authorization using OPA (Open Policy Agent).
 * 
 * @param opaClient - The OPA client used to evaluate the policy.
 * @param input - The input data for the policy evaluation.
 * @param logger - The logger service used for logging debug information.
 * @returns A middleware function that handles the authorization process.
 */
export const opaMiddleware = (opaClient: OpaClient, input: PermissionInput, logger: LoggerService) => {
  return async (_: Request, res: Response, next: NextFunction) => {
    try {

      logger.debug(`Sending input to OPA: ${JSON.stringify(input)}`);

      const opaResponse = await opaClient.evaluateGenericPolicy(input);

      logger.debug(`OPA Response: ${JSON.stringify(opaResponse)}`);

      // Check the OPA response and decide whether to allow the request
      if (opaResponse.result) {
        next(); // Allow the request to proceed
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
