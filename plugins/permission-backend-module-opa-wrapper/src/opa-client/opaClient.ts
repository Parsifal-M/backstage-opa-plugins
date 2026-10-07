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
   * Handles a failure to get a decision from OPA (server unreachable or a
   * non-2xx response). Applies the configured fallback decision if there is
   * one, otherwise logs and throws.
   */
  private handleOpaUnavailable(
    message: string,
  ): PermissionsFrameworkPolicyEvaluationResult {
    if (this.fallbackPolicyDecision === 'allow') {
      this.logger.warn(`${message}. Falling back to allow.`);
      return { result: 'ALLOW' };
    }
    if (this.fallbackPolicyDecision === 'deny') {
      this.logger.warn(`${message}. Falling back to deny.`);
      return { result: 'DENY' };
    }

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
    const opaUrl = `${this.baseUrl}/v1/data/${this.entryPoint}`;

    this.logger.debug(`Sending policy input to OPA: ${JSON.stringify(input)}`);

    let opaResponse: Response;
    try {
      opaResponse = await fetch(opaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });
    } catch (error: unknown) {
      // Any rejection from fetch itself is a transport failure (connection
      // refused, DNS, TLS, ...). Native fetch reports these as
      // `TypeError: fetch failed`, so we don't rely on the error name.
      return this.handleOpaUnavailable(
        `An error occurred while sending the policy input to the OPA server: ${error}`,
      );
    }

    if (!opaResponse.ok) {
      return this.handleOpaUnavailable(
        `An error response was returned after sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`,
      );
    }

    // A 2xx response we can't parse means OPA is reachable but something is
    // misconfigured, so we never apply the fallback here.
    let opaPermissionsResponse: PolicyEvaluationResponse;
    try {
      opaPermissionsResponse =
        (await opaResponse.json()) as PolicyEvaluationResponse;
    } catch (error: unknown) {
      const message = `Failed to parse the response from the OPA server: ${error}`;
      this.logger.error(message);
      throw new Error(message);
    }

    this.logger.debug(
      `Received data from OPA: ${JSON.stringify(opaPermissionsResponse)}`,
    );

    return opaPermissionsResponse.result;
  }
}
