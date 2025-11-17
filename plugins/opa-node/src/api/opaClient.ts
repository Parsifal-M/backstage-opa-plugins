import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import {
  PolicyInput,
  PolicyResult,
} from '@parsifal-m/backstage-plugin-opa-common';

export class OpaClient {
  private readonly logger: LoggerService;
  private readonly config: Config;
  private readonly baseUrl: string;

  constructor(config: Config, logger: LoggerService) {
    this.config = config;
    this.logger = logger;
    this.baseUrl = this.config.getString('openPolicyAgent.baseUrl');
  }

  async evaluatePolicy(
    input: PolicyInput,
    entryPoint: string,
  ): Promise<PolicyResult> {
    if (!this.baseUrl) {
      this.logger.error('The OPA URL is not set in the app-config!');
      throw new Error('The OPA URL is not set in the app-config!');
    }

    if (!entryPoint) {
      this.logger.error(
        'You have not defined a policy entrypoint! Please provide one.',
      );
      throw new Error(
        'You have not defined a policy entrypoint! Please provide one.',
      );
    }

    if (!input) {
      this.logger.error('The policy input is missing!');
      throw new Error('The policy input is missing!');
    }

    const opaUrl = `${this.baseUrl}/v1/data/${entryPoint}`;

    try {
      const response = await fetch(opaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const message = `An error response was returned after sending the policy input to the OPA server: ${response.status} - ${response.statusText}`;
        this.logger.error(message);
        throw new Error(message);
      }

      const evalResult = (await response.json()) as PolicyResult;
      this.logger.debug(
        `Received data from OPA: ${JSON.stringify(evalResult)}`,
      );

      return evalResult;
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
