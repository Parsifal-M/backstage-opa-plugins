import fetch from 'node-fetch';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import { PolicyEvaluationInput, PolicyEvaluationResult } from '../types';
import { ResponseError } from '@backstage/errors';

// NOTE: Something to think about here, we could directly make an API call to OPA on line 28
// instead of routing through the backend plugin. Something we need to think about.

export class OpaClient {
  private readonly backendBaseUrl: string;
  private readonly opaPackage?: string;
  private readonly logger: Logger;

  constructor(config: Config, logger: Logger) {
    this.backendBaseUrl = config.getString('backend.baseUrl');
    this.opaPackage = config.getOptionalString(
      'opaClient.policies.rbac.package',
    );
    this.logger = logger;
  }

  async evaluatePolicy(
    input: PolicyEvaluationInput,
    opaPackage?: string,
  ): Promise<PolicyEvaluationResult> {
    const setOpaPackage = opaPackage ?? this.opaPackage;

    if (!setOpaPackage) {
      throw new Error('OPA package not set or missing!');
    }
    this.logger.info(
      `Sending request to OPA: ${this.backendBaseUrl}/api/opa/opa-permissions/${setOpaPackage}`,
    );

    this.logger.info(`Sending input to OPA: ${JSON.stringify(input)}`);

    try {
      const response = await fetch(
        `${this.backendBaseUrl}/api/opa/opa-permissions/${setOpaPackage}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            policyInput: input,
          }),
        },
      );

      if (!response.ok) {
        throw await ResponseError.fromResponse(response);
      }

      const data = await response.json();

      this.logger.info(
        `Received response from OPA server: ${JSON.stringify(data)}`,
      );

      return data;
    } catch (error: unknown) {
      this.logger.error('Error during OPA policy evaluation:', error);
      throw new Error(`Failed to evaluate policy: ${error}`);
    }
  }
}
