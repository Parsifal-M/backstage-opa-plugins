import fetch from 'node-fetch';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { PolicyInput, PolicyResult } from '../types';

/**
 * OpaAuthzClient is a client for interacting with an Open Policy Agent (OPA) server.
 * It allows evaluating policies against given inputs and retrieving the results.
 */
export class OpaAuthzClient {
  private readonly baseUrl: string;
  private readonly logger: LoggerService;

  /**
   * Constructs a new OpaAuthzClient.
   *
   * @param config - The backend configuration object.
   * @param logger - A logger instance used for logging.
   */
  constructor(logger: LoggerService, config: Config) {
    this.baseUrl = config.getOptionalString('opaClient.baseUrl') ?? '';
    if (!this.baseUrl) {
      logger.error('The OPA URL is not set in the app-config!');
      throw new Error('The OPA URL is not set in the app-config!');
    }
    this.logger = logger;
  }

  /**
   * Evaluates a policy against a given input.
   *
   * @param input - The input to evaluate the policy against.
   * @param entryPoint - The entry point into the OPA policy to use.
   * @returns A promise that resolves to the result of the policy evaluation.
   * @throws An error if the OPA URL is not set or if the request to the OPA server fails.
   */
  async evaluatePolicy(
    input: PolicyInput,
    entryPoint: string,
  ): Promise<PolicyResult> {
    const url = `${this.baseUrl}/v1/data/${entryPoint}`;

    this.logger.debug(
      `OpaAuthzClient sending data to OPA: ${JSON.stringify(input)}`,
    );

    try {
      const opaResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!opaResponse.ok) {
        const message = `An error response was returned after sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`;
        this.logger.error(message);
        throw new Error(message);
      }

      const opaPermissionsResponse = (await opaResponse.json()) as PolicyResult;

      this.logger.debug(
        `Received data from OPA: ${JSON.stringify(opaPermissionsResponse)}`,
      );

      return opaPermissionsResponse;
    } catch (error: unknown) {
      this.logger.error(
        `An error occurred while sending the policy input to the OPA server: ${error}`,
      );
      throw new Error(
        `An error occurred while sending the policy input to the OPA server: ${error}`,
      );
    }
  }
}