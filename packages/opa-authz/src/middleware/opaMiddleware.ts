import { Request, Response, NextFunction } from 'express';
import { PolicyInput } from '../types';
import { LoggerService } from '@backstage/backend-plugin-api';
import { OpaAuthzClient } from '../api';

/**
 * Middleware function for handling authorization using OPA (Open Policy Agent).
 *
 * @param opaClient - An instance of OpaAuthzClient used to evaluate policies.
 * @param entryPoint - The entry point for the OPA policy evaluation.
 * @param setInput - A function that sets the policy input based on the request.
 * @param logger - (Optional) An instance of LoggerService for logging debug information.
 * @param customErrorMessage - (Optional) Custom error message to return when access is forbidden.
 *
 * @returns An Express middleware function that evaluates the policy and either allows the request to proceed or responds with an error.
 *
 * @example
 *
 * // Create an instance of OpaAuthzClient
 * const opaAuthzClient = new OpaAuthzClient(config, logger);
 *
 * // Set an entry point for the OPA policy
 * const entryPoint = 'authz';
 *
 * // Construct your policy input
 * const setInput = (req: Request): PolicyInput => {
 *   return {
 *     method: req.method,
 *     path: req.path,
 *     headers: req.headers,
 *     someFoo: 'bar',
 *   };
 * };
 *
 * router.get('/some-url', opaAuthzMiddleware(opaClient, entryPoint, setInput, logger), async (req, res, next) => {
 *   // Route handler logic
 * });
 *
 */

export const opaAuthzMiddleware = (
  opaClient: OpaAuthzClient,
  entryPoint: string,
  setInput: (req: Request) => PolicyInput,
  logger?: LoggerService,
  customErrorMessage?: string,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const input = setInput(req);
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
    } catch (error: unknown) {
      if (logger) {
        logger.error(
          `An error occurred while sending the policy input to the OPA server: ${error}`,
        );
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
