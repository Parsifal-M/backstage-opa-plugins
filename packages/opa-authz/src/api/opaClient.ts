import fetch from 'node-fetch';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { PolicyInput, PolicyResult } from '../types';

export class OpaAuthzClient {
  private readonly baseUrl: string;
  private readonly logger: LoggerService;

  /**
   * Constructs a new OpaAuthzClient.
   * @param config - The backend configuration object.
   * @param logger - A logger instance
   */
  constructor(config: Config, logger: LoggerService) {
    this.baseUrl = config.getString('opaClient.baseUrl');
    this.logger = logger;
  }

  /**
   * Evaluates a policy against a given input.
   * @param input - The input to evaluate the policy against.
   * @param entryPoint - The entry point into the OPA policy to use.
   */
  async evaluatePolicy(
    input: PolicyInput,
    entryPoint: string,
  ): Promise<PolicyResult> {
    const setEntryPoint = entryPoint;
    const baseUrl = this.baseUrl;
    const url = `${baseUrl}/v1/data/${setEntryPoint}`;

    if (!baseUrl) {
      this.logger.error('The OPA URL is not set in the app-config!');
      throw new Error('The OPA URL is not set in the app-config!');
    }

    if (!setEntryPoint) {
      this.logger.error(
        'The OPA entrypoint is not set in the evaluatePolicy method or in the app-config!',
      );
      throw new Error(
        'The OPA entrypoint is not set in the evaluatePolicy method or in the app-config!',
      );
    }

    if (!input) {
      this.logger.error('The policy input is missing!');
      throw new Error('The policy input is missing!');
    }

    this.logger.debug(`Sent data to OPA: ${JSON.stringify(input)}`);

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

      this.logger.debug('Received data from OPA:', {
        opaPermissionsResponse: JSON.stringify(opaPermissionsResponse),
      });

      return opaPermissionsResponse;
    } catch (error: unknown) {
      const message = `An error occurred while sending the policy input to the OPA server:`;
      this.logger.error(`${message} ${error}`);
      throw new Error(`${message} ${error}`);
    }
  }
}
