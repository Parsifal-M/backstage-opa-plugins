import fetch from 'node-fetch';
import { Config } from '@backstage/config';
import {
  PolicyEvaluationInput,
  PolicyEvaluationResult,
  PolicyEvaluationResponse,
} from '../types';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * OpaClient is a class responsible for interacting with the OPA server.
 * It provides a method to evaluate a policy against a given input.
 */
export class OpaClient {
  private readonly opaEntryPoint?: string;
  private readonly opaBaseUrl?: string;
  private readonly logger: LoggerService;

  /**
   * Constructs a new OpaClient.
   * @param config - The backend configuration object.
   * @param logger - A logger instance
   */
  constructor(config: Config, logger: LoggerService) {
    this.opaEntryPoint = config.getOptionalString(
      'opaClient.policies.permissions.entrypoint',
    );
    this.logger = logger;
    this.opaBaseUrl = config.getOptionalString('opaClient.baseUrl');
  }

  /**
   * Evaluates a policy against a given input.
   * @param input - The input to evaluate the policy against.
   * @param opaEntryPoint - The entry point into the OPA policy to use. You can optionally provide the entry point here, otherwise it will be taken from the app-config.
   */
  async evaluatePolicy(
    input: PolicyEvaluationInput,
    opaEntryPoint?: string,
  ): Promise<PolicyEvaluationResult> {
    const setEntryPoint = opaEntryPoint ?? this.opaEntryPoint;
    const opaBaseUrl = this.opaBaseUrl;
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

      if (!opaResponse.ok) {
        this.logger.error(
          `An error occurred while sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`,
        );
        throw new Error(
          `An error occurred while sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`,
        );
      }

      const opaPermissionsResponse =
        (await opaResponse.json()) as PolicyEvaluationResponse;
      this.logger.debug('Received data from OPA:', {
        opaPermissionsResponse: JSON.stringify(opaPermissionsResponse),
      });
      return opaPermissionsResponse.result;
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
