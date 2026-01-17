import { Config } from '@backstage/config';
import {
  FallbackPolicyDecision,
  PermissionsFrameworkPolicyEvaluationResult,
  PermissionsFrameworkPolicyInput,
  PolicyEvaluationResponse,
} from '../types';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * OpaClient is a class responsible for interacting with the OPA server for Backstage permissions framework.
 * It provides methods for evaluating permissions framework policies by sending requests to the OPA server.
 */
export class OpaClient {
  private readonly entryPoint: string;
  private readonly baseUrl: string;
  private readonly fallbackPolicyDecision?: FallbackPolicyDecision;
  private readonly logger: LoggerService;

  /**
   * Constructs a new OpaClient.
   * @param config - The backend configuration object.
   * @param logger - A logger instance
   */
  constructor(config: Config, logger: LoggerService) {
    this.entryPoint = config.getString(
      'permission.opa.policy.policyEntryPoint',
    );
    this.baseUrl = config.getString('permission.opa.baseUrl');

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
   * Unified error handling with optional fallback policy support.
   */
  private handleOpaError<T>(
    error: unknown,
    fallbackPolicy?: FallbackPolicyDecision,
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
        // Return the appropriate structure for permissions framework call
        return { result: { result: 'ALLOW' } } as T;
      } else if (fallbackPolicy === 'deny') {
        this.logger.warn(`${message}. Falling back to deny.`);
        // Return the appropriate structure for permissions framework call
        return { result: { result: 'DENY' } } as T;
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
   * Evaluates a backstage permissions framework policy against a given input.
   *
   * @param input - The input to evaluate the policy against.
   */
  async evaluatePermissionsFrameworkPolicy(
    input: PermissionsFrameworkPolicyInput,
  ): Promise<PermissionsFrameworkPolicyEvaluationResult> {
    if (!this.baseUrl) {
      this.logger.error('The OPA URL is not set in the app-config!');
      throw new Error('The OPA URL is not set in the app-config!');
    }

    if (!this.entryPoint) {
      this.logger.error('The OPA entrypoint is not set in the app-config!');
      throw new Error('The OPA entrypoint is not set in the app-config!');
    }

    if (!input) {
      this.logger.error('The policy input is missing!');
      throw new Error('The policy input is missing!');
    }

    const opaUrl = `${this.baseUrl}/v1/data/${this.entryPoint}`;

    try {
      const opaResponse = await fetch(opaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!opaResponse.ok) {
        const error = new Error(
          `HTTP ${opaResponse.status} - ${opaResponse.statusText}`,
        );
        return this.handleOpaError<PolicyEvaluationResponse>(
          error,
          this.fallbackPolicyDecision,
        ).result;
      }

      const opaPermissionsResponse =
        (await opaResponse.json()) as PolicyEvaluationResponse;
      this.logger.debug(
        `Received data from OPA: ${JSON.stringify(opaPermissionsResponse)}`,
      );

      return opaPermissionsResponse.result;
    } catch (error: unknown) {
      return this.handleOpaError<PolicyEvaluationResponse>(
        error,
        this.fallbackPolicyDecision,
      ).result;
    }
  }
}
