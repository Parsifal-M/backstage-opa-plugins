import fetch from 'node-fetch';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { OpaResponse, PermissionInput } from './types';

/**
 * OpaClient is a class responsible for interacting with the OPA server.
 * It provides a method to evaluate a policy against a given input.
 */
export class OpaClient {
  private readonly opaBaseUrl?: string;
  private readonly entryPoint?: string;
  private readonly logger: LoggerService;

  /**
   * Constructs a new OpaClient.
   * @param config - The backend configuration object.
   * @param logger - A logger instance
   */
  constructor(config: Config, logger: LoggerService) {
    this.opaBaseUrl = config.getOptionalString('opaAuthz.baseUrl');
    this.entryPoint = config.getOptionalString('opaAuthz.entryPoint')
    this.logger = logger;
  }

  /**
   * Evaluates a policy against a given input.
   * @param input - The input to evaluate the policy against.
   * @param opaEntryPoint - The entry point into the OPA policy to use. You can optionally provide the entry point here, otherwise it will be taken from the app-config.
   * @param opaFallbackPolicy - The fallback policy to use when the OPA server is unavailable or unresponsive. You can optionally provide the fallback policy here, otherwise it will be taken from the app-config.
   */
  async evaluatePolicy(input: PermissionInput): Promise<OpaResponse> {
    const opaBaseUrl = this.opaBaseUrl;
    const setEntryPoint = input.entryPoint ?? this.entryPoint;
    const url = `${opaBaseUrl}/v1/data/${setEntryPoint}`;

    if (!opaBaseUrl) {
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

      const opaEvaluationResponse = (await opaResponse.json()) as OpaResponse;
      this.logger.debug('Received data from OPA:', {
        opaEvaluationResponse: JSON.stringify(opaEvaluationResponse),
      });
      return opaEvaluationResponse;
    } catch (error: unknown) {
      const message = `An error occurred while sending the policy input to the OPA server:`;
      this.logger.error(`${message} ${error}`);
      throw new Error(`${message} ${error}`);
    }
  }
}
