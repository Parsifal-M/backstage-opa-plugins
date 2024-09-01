import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import {
  OpaFallbackPolicy,
  PolicyEvaluationInput,
  PermissionInput,
  PolicyEvaluationResult,
  OpaResponse,
} from '../types';

export class OpaClient {
  private readonly policyEntryPoint?: string;
  private readonly opaBaseUrl?: string;
  private readonly opaFallbackPolicy?: OpaFallbackPolicy;
  private readonly logger: LoggerService;

  constructor(config: Config, logger: LoggerService) {
    this.policyEntryPoint = config.getOptionalString(
      'opaClient.policies.permissions.entrypoint',
    );
    this.opaBaseUrl = config.getOptionalString('opaClient.baseUrl');
    this.logger = logger;

    const bareFallbackPolicy = config
      .getOptionalString('opaClient.policies.permissions.policyFallback')
      ?.toLocaleLowerCase('en-US');
    if (bareFallbackPolicy === 'allow' || bareFallbackPolicy === 'deny') {
      this.opaFallbackPolicy = bareFallbackPolicy;
    } else {
      this.opaFallbackPolicy = undefined;
    }
  }

  /**
   * Validates the inputs for the OPA client.
   *
   * @param opaBaseUrl - The base URL of the OPA server.
   * @param setEntryPoint - The entry point for policy evaluation.
   * @param input - The input for policy evaluation.
   * @throws Error if any of the required inputs are missing.
   */
  private validateInputs(
    opaBaseUrl?: string,
    setEntryPoint?: string,
    input?: PolicyEvaluationInput | PermissionInput,
  ): void {
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
  }

  /**
   * Sends a request to the specified URL with the given input.
   * @param url - The URL to send the request to.
   * @param input - The input data for the request.
   * @returns A promise that resolves to the response from the server.
   */
  private async sendRequest(url: string, input: any): Promise<Response> {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });
  }

  /**
   * Handles the response from OPA for the permission framework.
   *
   * @param opaResponse - The response from the OPA server.
   * @param policyFallback - The fallback policy to use in case of an error response.
   * @returns A promise that resolves to a `PolicyEvaluationResult`.
   */
  private async handlePermissionFrameworkResponse(
    opaResponse: Response,
    policyFallback?: OpaFallbackPolicy,
  ): Promise<PolicyEvaluationResult> {
    if (!opaResponse.ok) {
      const message = `An error response was returned after sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`;
      return this.handleFallback(message, policyFallback);
    }

    const opaPermissionsResponse = await opaResponse.json();
    this.logger.debug('Received data from OPA:', {
      opaPermissionsResponse: JSON.stringify(opaPermissionsResponse),
    });
    return opaPermissionsResponse.result;
  }

  /**
   * Handles the response from OPA for a generic policy.
   *
   * @param opaResponse - The response from the OPA server.
   * @returns A promise that resolves to an `OpaResponse`.
   */
  private async handleGenericPermissionResponse(
    opaResponse: Response,
  ): Promise<OpaResponse> {
    if (!opaResponse.ok) {
      const message = `An error response was returned after sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`;
      this.logger.error(message);
      throw new Error(message);
    }

    const opaPermissionsResponse = await opaResponse.json();
    this.logger.debug('Received data from OPA:', {
      opaPermissionsResponse: JSON.stringify(opaPermissionsResponse),
    });
    return opaPermissionsResponse;
  }

  /**
   * Handles the fallback behavior for policy evaluation.
   *
   * @param message - The error message to be logged.
   * @param policyFallback - The fallback policy to be applied. Can be 'allow' or 'deny'.
   * @returns The result of the policy evaluation.
   * @throws Error if the policy fallback is not 'allow' or 'deny'.
   */
  private handleFallback(
    message: string,
    policyFallback?: OpaFallbackPolicy,
  ): PolicyEvaluationResult {
    if (policyFallback === 'allow') {
      this.logger.warn(`${message}. Falling back to allow.`);
      return { result: 'ALLOW' };
    } else if (policyFallback === 'deny') {
      this.logger.warn(`${message}. Falling back to deny.`);
      return { result: 'DENY' };
    }
    this.logger.error(message);
    throw new Error(message);
  }

  /**
   * Handles errors that occur while sending the policy input to the OPA server.
   *
   * @param error - The error that occurred.
   * @param policyFallback - The fallback policy to use in case of an error.
   * @returns The result of the policy evaluation.
   * @throws An error with the error message if the error is not a FetchError.
   */
  private handlePermissionFrameworkError(
    error: unknown,
    policyFallback?: OpaFallbackPolicy,
  ): PolicyEvaluationResult {
    const message = `An error occurred while sending the policy input to the OPA server:`;

    if (error instanceof Error && error.name === 'FetchError') {
      return this.handleFallback(`${message} ${error}`, policyFallback);
    }
    this.logger.error(`${message} ${error}`);
    throw new Error(`${message} ${error}`);
  }

  /**
   * Handles errors that occur while sending the policy input to the OPA server.
   *
   * @param error - The error that occurred.
   * @returns The result of the policy evaluation.
   * @throws An error with the error message.
   */
  private handleGenericPolicyError(error: unknown): OpaResponse {
    const message = `An error occurred while sending the policy input to the OPA server:`;

    this.logger.error(`${message} ${error}`);
    throw new Error(`${message} ${error}`);
  }

  /**
   * Evaluates the permission framework policy.
   *
   * @param input - The policy evaluation input.
   * @returns A promise that resolves to the policy evaluation result.
   */
  async evaluatePermissionFrameworkPolicy(
    input: PolicyEvaluationInput,
  ): Promise<PolicyEvaluationResult> {
    const entryPoint = this.policyEntryPoint;
    const opaBaseUrl = this.opaBaseUrl;
    const policyFallback = this.opaFallbackPolicy;

    this.validateInputs(opaBaseUrl, entryPoint, input);

    const url = `${opaBaseUrl}/v1/data/${entryPoint}`;
    this.logger.debug(`Sent data to OPA: ${JSON.stringify(input)}`);

    try {
      const opaResponse = await this.sendRequest(url, input);
      return await this.handlePermissionFrameworkResponse(
        opaResponse,
        policyFallback,
      );
    } catch (error: unknown) {
      return this.handlePermissionFrameworkError(error, policyFallback);
    }
  }

  /**
   * Evaluates a generic policy using the provided input.
   *
   * @param input - The permission input for the policy evaluation.
   * @param policyEntryPoint - The entry point of the policy. If not provided, the default entry point will be used.
   * @returns A promise that resolves to the OpaResponse object representing the result of the policy evaluation.
   */
  async evaluateGenericPolicy(
    input: PermissionInput,
    policyEntryPoint?: string,
  ): Promise<OpaResponse> {
    const opaBaseUrl = this.opaBaseUrl;
    const entryPoint = policyEntryPoint ?? this.policyEntryPoint;

    this.validateInputs(opaBaseUrl, entryPoint, input);

    const url = `${opaBaseUrl}/v1/data/${entryPoint}`;
    this.logger.error(`Sent data to OPA: ${JSON.stringify(input)}`);
    this.logger.error(`Using entry point: ${entryPoint}`);
    this.logger.error(`Using OPA URL: ${opaBaseUrl}`);

    try {
      const opaResponse = await this.sendRequest(url, input);
      return await this.handleGenericPermissionResponse(opaResponse);
    } catch (error: unknown) {
      return this.handleGenericPolicyError(error);
    }
  }
}
