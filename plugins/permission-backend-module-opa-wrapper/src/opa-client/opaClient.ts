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
 * It provides two methods for evaluating policies:
 * - evaluatePolicy: Evaluates a generic permission policy by sending the input to the OPA server and returns the result.
 * - evaluatePermissionsFrameworkPolicy: Evaluates a backstage permissions framework policy against a given input.
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
      'opaClient.policies.permissions.entrypoint',
    );
    this.baseUrl = config.getOptionalString('opaClient.baseUrl');

    this.logger = logger;

    const bareFallbackPolicy = config
      .getOptionalString('opaClient.policies.permissions.policyFallback')
      ?.toLocaleLowerCase('en-US');
    if (bareFallbackPolicy === 'allow' || bareFallbackPolicy === 'deny') {
      this.fallbackPolicyDecision = bareFallbackPolicy;
    } else {
      this.fallbackPolicyDecision = undefined;
    }
  }

  /**
   * Evaluates a backstage permissions framework policy against a given input.
   *
   * @param input - The input to evaluate the policy against.
   * @param entryPoint - The entry point into the OPA policy to use. You can optionally provide the entry point here, otherwise it will be taken from the app-config.
   * @param fallbackPolicyDecision - The fallback policy decision to use when the OPA server is unavailable or unresponsive. You can optionally provide the fallback policy here, otherwise it will be taken from the app-config.
   */
  async evaluatePermissionsFrameworkPolicy(
    input: PermissionsFrameworkPolicyInput,
    entryPoint?: string,
  ): Promise<PermissionsFrameworkPolicyEvaluationResult> {
    const setEntryPoint = entryPoint ?? this.entryPoint;
    const baseUrl = this.baseUrl;
    const policyFallback = this.fallbackPolicyDecision;
    const url = `${baseUrl}/v1/data/${setEntryPoint}`;

    if (!baseUrl) {
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

    this.logger.debug(`Sent data to OPA: ${JSON.stringify(input)}`);

    try {
      const opaResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!opaResponse.ok) {
        const message = `An error response was returned after sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`;

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

      const opaPermissionsResponse =
        (await opaResponse.json()) as PolicyEvaluationResponse;
      this.logger.debug('Received data from OPA:', {
        opaPermissionsResponse: JSON.stringify(opaPermissionsResponse),
      });
      return opaPermissionsResponse.result;
    } catch (error: unknown) {
      const message = `An error occurred while sending the policy input to the OPA server:`;

      if (error instanceof Error && error.name === 'FetchError') {
        if (policyFallback === 'allow') {
          this.logger.warn(`${message} ${error}. Falling back to allow.`);
          return { result: 'ALLOW' };
        } else if (policyFallback === 'deny') {
          this.logger.warn(`${message} ${error}. Falling back to deny.`);
          return { result: 'DENY' };
        }
      }
      this.logger.error(`${message} ${error}`);
      throw new Error(`${message} ${error}`);
    }
  }

  /**
   * Overloaded function signatures for evaluatePolicy.
   */
  async evaluatePolicy(
    input: PolicyInput,
    entryPoint: string,
  ): Promise<PolicyResult>;
  async evaluatePolicy<T>(input: PolicyInput, entryPoint: string): Promise<T>;
  
  /**
   * Evaluates a generic policy by sending the input to the OPA server and returns the result.
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
    const url = `${this.baseUrl}/v1/data/${entryPoint}`;

    this.logger.debug(
      `OpaAuthzClient sending data to OPA: ${JSON.stringify(input)}`,
    );

    try {
      const opaResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!opaResponse.ok) {
        const message = `An error response was returned after sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`;
        this.logger.error(message);
        throw new Error(message);
      }

      const opaPermissionsResponse = (await opaResponse.json()) as T;

      this.logger.debug(
        `Received data from OPA: ${JSON.stringify(opaPermissionsResponse)}`,
      );

      return opaPermissionsResponse;
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
