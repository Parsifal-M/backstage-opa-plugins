import { Config } from '@backstage/config';
import { Logger } from 'winston';
import fetch from 'node-fetch';

export class OpaClient {
  private readonly baseUrl: string;
  private readonly logger: Logger;
  private readonly package: string;

  constructor(config: Config, logger: Logger) {
    this.baseUrl = config.getString('opa-client.opa.baseUrl');
    this.package = config.getString('opa-client.opa.policies.catalog.package');
    this.logger = logger;
  }

  async evaluatePolicy(input: any): Promise<any> {
    this.logger.info(
      `Sending request to OPA server: ${this.baseUrl}/v1/data/${this.package}`,
    );

    // Log the input being sent to OPA
    this.logger.info(`Request input for OPA: ${JSON.stringify(input)}`);

    try {
      const response = await fetch(`${this.baseUrl}/v1/data/${this.package}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        this.logger.error(
          `Failed to evaluate policy, status=${response.status}, details=${errorDetails}`,
        );
        throw new Error(
          `Failed to evaluate policy, status=${response.status}, details=${errorDetails}`,
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (error) {
        this.logger.error('Error parsing OPA server response');
        throw new Error('Error parsing OPA server response');
      }

      this.logger.info(
        `Received response from OPA server: ${JSON.stringify(data)}`,
      );

      return data.result;
    } catch (error) {
      this.logger.error('Error during OPA policy evaluation');
      throw error;
    }
  }
}

export function createOpaClient(config: Config, logger: Logger): OpaClient {
  return new OpaClient(config, logger);
}
