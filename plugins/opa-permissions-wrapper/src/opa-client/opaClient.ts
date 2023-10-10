import axios from 'axios';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import { PolicyEvaluationInput, PolicyEvaluationResult } from '../../types';

export class OpaClient {
  private readonly baseUrl: string;
  private readonly logger: Logger;

  constructor(config: Config, logger: Logger) {
    this.baseUrl = config.getString('backend.baseUrl');
    this.logger = logger;
  }

  async evaluatePolicy(
    input: PolicyEvaluationInput,
    opaPackage: string
  ): Promise<PolicyEvaluationResult> {
    this.logger.info(
      `Sending request to catalog-permission route at ${this.baseUrl}/api/opa/opa-permissions`,
    );



    try {
      const response = await axios.post(
        `${this.baseUrl}/api/opa/opa-permissions`,
        {
          policyInput: input,
          opaPackage: opaPackage
        },
      );

      this.logger.info(
        `Received response from OPA server: ${JSON.stringify(response.data)}`,
      );

      return response.data;
    } catch (error: unknown) {
      this.logger.error('Error during OPA policy evaluation:', error);
      throw new Error(`Failed to evaluate policy: ${error}`);
    }
  }
}
