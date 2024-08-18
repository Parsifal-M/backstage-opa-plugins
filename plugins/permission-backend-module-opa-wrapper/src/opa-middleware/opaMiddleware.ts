import { Request, Response, NextFunction } from 'express';
import { PermissionInput } from '../types';
import { OpaClient } from '../opa-client/opaClient';
import { LoggerService } from '@backstage/backend-plugin-api';

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
