import fetch from 'node-fetch';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import { PolicyEvaluationInput, PolicyEvaluationResult } from '../types';
import { ResponseError } from '@backstage/errors';
import { DiscoveryService } from '@backstage/backend-plugin-api';

// NOTE: Something to think about here, we could directly make an API call to OPA on line 28
// instead of routing through the backend plugin. Something we need to think about.

export class OpaClient {
  private readonly opaPackage?: string;
  private readonly discovery: DiscoveryService;
  private readonly logger: Logger;

  constructor(config: Config, logger: Logger, discovery: DiscoveryService) {
    this.opaPackage = config.getOptionalString(
      'opaClient.policies.rbac.package',
    );
    this.logger = logger;
    this.discovery = discovery;
  }

  async evaluatePolicy(
    input: PolicyEvaluationInput,
    opaPackage?: string,
  ): Promise<PolicyEvaluationResult> {
    const setOpaPackage = opaPackage ?? this.opaPackage;
    const baseUrl = await this.discovery.getBaseUrl('opa');
    const url = `${baseUrl}/opa-permissions/${setOpaPackage}`;

    if (!setOpaPackage) {
      throw new Error('OPA package not set or missing!');
    }
    this.logger.info(`Sending request to OPA: ${url}`);

    this.logger.info(`Sending input to OPA: ${JSON.stringify(input)}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policyInput: input,
        }),
      });

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
