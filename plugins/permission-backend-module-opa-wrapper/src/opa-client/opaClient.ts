import { Config } from '@backstage/config';
import {
  FallbackPolicyDecision,
  PermissionsFrameworkPolicyEvaluationResult,
  PermissionsFrameworkPolicyInput,
  PolicyEvaluationResponse,
  PolicyInput,
  PolicyResult,
} from '../types';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * OpaClient is a class responsible for interacting with the OPA server.
 * It provides methods for evaluating policies by sending requests to the OPA server.
 */
export class OpaClient {
  private readonly entryPoint?: string;
  private readonly baseUrl?: string;
  private readonly fallbackPolicyDecision?: FallbackPolicyDecision;
  private readonly logger: LoggerService;

  /**
   * Constructs a new OpaClient.
   * @param config - The backend configuration object.
   * @param logger - A logger instance
   */
  constructor(config: Config, logger: LoggerService) {
    this.entryPoint = config.getOptionalString(
      'permission.opa.policy.policyEntryPoint',
    );
    this.baseUrl = config.getOptionalString('permission.opa.baseUrl');

    this.logger = logger;

    const bareFallbackPolicy = config
      .getOptionalString('permission.opa.policy.policyFallbackDecision')
      ?.toLocaleLowerCase('en-US');
    if (bareFallbackPolicy === 'allow' || bareFallbackPolicy === 'deny') {
      this.fallbackPolicyDecision = bareFallbackPolicy;
    } else {
      this.fallbackPolicyDecision = undefined;
    }
  }

  /**
   * Common HTTP request logic for OPA communication.
   */
  private async makeOpaRequest<T>(
    url: string,
    input: unknown,
    fallbackPolicy?: FallbackPolicyDecision,
    isPermissionsFramework: boolean = false,
  ): Promise<T> {
    this.logger.debug(`Sending data to OPA: ${JSON.stringify(input)}`);

    try {
      const opaResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!opaResponse.ok) {
        return this.handleOpaError<T>(
          new Error(`HTTP ${opaResponse.status} - ${opaResponse.statusText}`),
          fallbackPolicy,
          isPermissionsFramework,
        );
      }

      const opaPermissionsResponse = (await opaResponse.json()) as T;
      this.logger.debug(
        `Received data from OPA: ${JSON.stringify(opaPermissionsResponse)}`,
      );

      return opaPermissionsResponse;
    } catch (error: unknown) {
      return this.handleOpaError<T>(
        error,
        fallbackPolicy,
        isPermissionsFramework,
      );
    }
  }

  /**
   * Unified error handling with optional fallback policy support.
   */
  private handleOpaError<T>(
    error: unknown,
    fallbackPolicy?: FallbackPolicyDecision,
    isPermissionsFramework: boolean = false,
  ): T {
    const isHttpError =
      error instanceof Error && error.message.startsWith('HTTP');
    const isFetchError = error instanceof Error && error.name === 'FetchError';

    // Handle fallback policy for network errors or HTTP errors
    if (fallbackPolicy && (isFetchError || isHttpError)) {
      const message = isHttpError
        ? `An error response was returned after sending the policy input to the OPA server: ${error.message.replace(
            'HTTP ',
            '',
          )}`
        : `An error occurred while sending the policy input to the OPA server: ${error}`;

      if (fallbackPolicy === 'allow') {
        this.logger.warn(`${message}. Falling back to allow.`);
        // Return the appropriate structure based on the method type
        return (
          isPermissionsFramework
            ? { result: { result: 'ALLOW' } }
            : { result: 'ALLOW' }
        ) as T;
      } else if (fallbackPolicy === 'deny') {
        this.logger.warn(`${message}. Falling back to deny.`);
        // Return the appropriate structure based on the method type
        return (
          isPermissionsFramework
            ? { result: { result: 'DENY' } }
            : { result: 'DENY' }
        ) as T;
      }
    }

    // For non-fallback errors or when no fallback is configured
    const message = isHttpError
      ? `An error response was returned after sending the policy input to the OPA server: ${error.message.replace(
          'HTTP ',
          '',
        )}`
      : `An error occurred while sending the policy input to the OPA server: ${error}`;

    this.logger.error(message);
    throw new Error(message);
  }

  /**
   * Validates required configuration and parameters before making OPA requests.
   */
  private validateConfig(input: unknown, entryPoint?: string): string {
    if (!this.baseUrl) {
      this.logger.error('The OPA URL is not set in the app-config!');
      throw new Error('The OPA URL is not set in the app-config!');
    }

    const setEntryPoint = entryPoint ?? this.entryPoint;
    if (!setEntryPoint) {
      this.logger.error(
        'The OPA entrypoint is not set in the method parameter or in the app-config!',
      );
      throw new Error(
        'The OPA entrypoint is not set in the method parameter or in the app-config!',
      );
    }

    if (!input) {
      this.logger.error('The policy input is missing!');
      throw new Error('The policy input is missing!');
    }

    return setEntryPoint;
  }

  /**
   * Evaluates a backstage permissions framework policy against a given input.
   *
   * @param input - The input to evaluate the policy against.
   * @param entryPoint - The entry point into the OPA policy to use. You can optionally provide the entry point here, otherwise it will be taken from the app-config.
   */
  async evaluatePermissionsFrameworkPolicy(
    input: PermissionsFrameworkPolicyInput,
    entryPoint?: string,
  ): Promise<PermissionsFrameworkPolicyEvaluationResult> {
    const setEntryPoint = this.validateConfig(input, entryPoint);
    const url = `${this.baseUrl}/v1/data/${setEntryPoint}`;

    const response = await this.makeOpaRequest<PolicyEvaluationResponse>(
      url,
      input,
      this.fallbackPolicyDecision,
      true, // This is a permissions framework call
    );

    return response.result;
  }

  /**
   * Evaluates a generic policy by sending the input to the OPA server and returns the result.
   * This method does not include fallback policy support - it will throw errors if OPA is unavailable.
   *
   * @param input - The policy input to be evaluated.
   * @param entryPoint - The entry point in the OPA server where the policy is defined.
   * @returns A promise that resolves to the policy result.
   * @throws An error if the OPA server returns a non-OK response or if there is an issue with the request.
   */
  async evaluatePolicy<T = PolicyResult>(
    input: PolicyInput,
    entryPoint: string,
  ): Promise<T> {
    this.validateConfig(input, entryPoint);
    const url = `${this.baseUrl}/v1/data/${entryPoint}`;

    return this.makeOpaRequest<T>(url, input, undefined, false); // Generic policy call, no fallback
  }
}
