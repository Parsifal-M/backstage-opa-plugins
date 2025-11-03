import { LoggerService } from '@backstage/backend-plugin-api';
import { PolicyInput, PolicyResult } from '@parsifal-m/backstage-plugin-opa-common';

export class OpaClient {
  private readonly baseUrl: string;
  private readonly logger?: LoggerService;

  constructor(options: { baseUrl: string; logger?: LoggerService }) {
    if (!options?.baseUrl) {
      throw new Error('The OPA baseUrl is required to construct OpaClient');
    }
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.logger = options.logger;
  }

  private logDebug(message: string) {
    if (this.logger?.debug) this.logger.debug(message);
  }

  private logError(message: string) {
    if (this.logger?.error) this.logger.error(message);
  }

  private validate(input: unknown, entryPoint: string) {
    if (!entryPoint) {
      this.logError('The OPA entrypoint is required');
      throw new Error('The OPA entrypoint is required');
    }
    if (input === undefined || input === null) {
      this.logError('The policy input is missing');
      throw new Error('The policy input is missing');
    }
  }

  private async makeOpaRequest<T>(url: string, input: unknown): Promise<T> {
    this.logDebug(`Sending data to OPA: ${JSON.stringify(input)}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const message = `An error response was returned after sending the policy input to the OPA server: ${response.status} - ${response.statusText}`;
      this.logError(message);
      throw new Error(message);
    }

    const json = (await response.json()) as T;
    this.logDebug(`Received data from OPA: ${JSON.stringify(json)}`);
    return json;
  }

  async evaluatePolicy<T = PolicyResult>(
    input: PolicyInput,
    entryPoint: string,
  ): Promise<T> {
    this.validate(input, entryPoint);
    const url = `${this.baseUrl}/v1/data/${entryPoint}`;
    return this.makeOpaRequest<T>(url, input);
  }
}
