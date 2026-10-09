import { Config } from '@backstage/config';
import {
  FallbackPolicyDecision,
  PermissionsFrameworkPolicyEvaluationResult,
  PermissionsFrameworkPolicyInput,
} from '../types';
import { LoggerService } from '@backstage/backend-plugin-api';

/**
 * OpaClient is a class responsible for interacting with the OPA server for Backstage permissions framework.
 * It provides methods for evaluating permissions framework policies by sending requests to the OPA server.
 */
export class OpaClient {
  private readonly opaUrl: string;
  private readonly fallbackPolicyDecision?: FallbackPolicyDecision;
  private readonly logger: LoggerService;

  /**
   * Constructs a new OpaClient.
   * @param config - The backend configuration object.
   * @param logger - A logger instance
   */
  constructor(config: Config, logger: LoggerService) {
    const entryPoint = config.getString(
      'permission.opa.policy.policyEntryPoint',
    );
    const baseUrl = config.getString('permission.opa.baseUrl');
    this.opaUrl = OpaClient.buildOpaUrl(baseUrl, entryPoint);

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
   * Builds and validates the OPA data API URL up front. Native fetch rejects
   * invalid or non-HTTP(S) URLs with the same `TypeError` it uses for network
   * failures, so a misconfigured URL must be caught here (failing startup)
   * rather than at request time, where it would trigger the fallback decision.
   */
  private static buildOpaUrl(baseUrl: string, entryPoint: string): string {
    let url: URL;
    try {
      url = new URL(`${baseUrl}/v1/data/${entryPoint}`);
    } catch {
      throw new Error(
        `Invalid OPA URL built from permission.opa.baseUrl "${baseUrl}" and permission.opa.policy.policyEntryPoint "${entryPoint}"`,
      );
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(
        `permission.opa.baseUrl must be an http:// or https:// URL, got "${baseUrl}"`,
      );
    }
    return url.toString();
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
    this.logger.debug(`Sending policy input to OPA: ${JSON.stringify(input)}`);

    let opaResponse: Response;
    try {
      opaResponse = await fetch(this.opaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });
    } catch (error: unknown) {
      // The URL is validated in the constructor, so any rejection here is a
      // transport failure (connection refused, DNS, TLS, ...). Native fetch
      // reports these as `TypeError: fetch failed`, so we don't rely on the
      // error name.
      return this.handleOpaUnavailable(
        `An error occurred while sending the policy input to the OPA server: ${error}`,
      );
    }

    if (!opaResponse.ok) {
      return this.handleOpaUnavailable(
        `An error response was returned after sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`,
      );
    }

    // A 2xx response we can't use means OPA is reachable but something is
    // misconfigured, so we never apply the fallback here.
    let body: unknown;
    try {
      body = await opaResponse.json();
    } catch (error: unknown) {
      const message = `Failed to parse the response from the OPA server: ${error}`;
      this.logger.error(message);
      throw new Error(message);
    }

    this.logger.debug(`Received data from OPA: ${JSON.stringify(body)}`);

    // OPA answers `{}` when the entry point is undefined (e.g. the policy is
    // not loaded), and the entry point may resolve to a non-object value.
    const result = OpaClient.hasResult(body) ? body.result : undefined;
    if (!OpaClient.isEvaluationResult(result)) {
      const message =
        'The result is missing in the response from OPA, are you sure the policy is loaded and the entry point returns an object with a string "result" field?';
      this.logger.error(message);
      throw new Error(message);
    }

    return result;
  }

  private static hasResult(value: unknown): value is { result: unknown } {
    return typeof value === 'object' && value !== null && 'result' in value;
  }

  private static isEvaluationResult(
    value: unknown,
  ): value is PermissionsFrameworkPolicyEvaluationResult {
    return OpaClient.hasResult(value) && typeof value.result === 'string';
  }
}
