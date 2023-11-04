import axios from 'axios';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import { PolicyEvaluationInput } from '../types';

export class OpaClient {
  private readonly baseUrl: string;
  private readonly logger: Logger;

  constructor(config: Config, logger: Logger) {
    this.baseUrl = config.getString('backend.baseUrl');
    this.logger = logger;
  }

  async evaluatePolicy(input: PolicyEvaluationInput): Promise<any> {
    this.logger.info(
      `Sending request to OPA: ${this.baseUrl}/api/opa/opa-permissions`,
    );

    this.logger.info(`Sending request to OPA: ${JSON.stringify(input)}`);

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/opa/opa-permissions`,
        {
          policyInput: input,
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
