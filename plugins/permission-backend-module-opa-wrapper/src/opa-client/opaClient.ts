import fetch from 'node-fetch';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import {
  PolicyEvaluationInput,
  PolicyEvaluationResult,
  PolicyEvaluationResponse,
} from '../types';

/**
 * OpaClient is a class responsible for interacting with the OPA server.
 * It provides a method to evaluate a policy against a given input.
 */
export class OpaClient {
  private readonly opaEntryPoint?: string;
  private readonly opaBaseUrl?: string;
  private readonly logger: Logger;

  /**
   * Constructs a new OpaClient.
   * @param config - The backend configuration object.
   * @param logger - A logger instance
   */
  constructor(config: Config, logger: Logger) {
    this.opaEntryPoint = config.getOptionalString(
      'opaClient.policies.permissions.entrypoint',
    );
    this.logger = logger;
    this.opaBaseUrl = config.getOptionalString('opaClient.baseUrl');
  }

  /**
   * Evaluates a policy against a given input.
   * @param input - The input to evaluate the policy against.
   * @param opaEntryPoint - The OPA package to use. You can optionally provide the package here, otherwise it will be taken from the app-config.
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
        'The OPA package is not set in the evaluatePolicy method or in the app-config!',
      );
      throw new Error(
        'The OPA package is not set in the evaluatePolicy method or in the app-config!',
      );
    }

    if (!input) {
      this.logger.error('The policy input is missing!');
      throw new Error('The policy input is missing!');
    }

    try {
      const opaResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      this.logger.debug('Sending policy input to the OPA server...');

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
      return opaPermissionsResponse.result;
    } catch (error: unknown) {
      this.logger.error(
        'An error occurred while sending the policy input to the OPA server:',
        error,
      );
      throw new Error(
        `An error occurred while sending the policy input to the OPA server: ${error}`,
      );
    }
  }
}
