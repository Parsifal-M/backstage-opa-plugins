import { LoggerService } from "@backstage/backend-plugin-api";
import { Config } from "@backstage/config";
import { OpaFallbackPolicy, PolicyEvaluationInput, PermissionInput, PolicyEvaluationResult, OpaResponse } from "../types";

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
      return await this.handleResponse(opaResponse, policyFallback);
    } catch (error: unknown) {
      return this.handleError(error, policyFallback);
    }
  }

  async evaluateGenericPolicy(
    input: PermissionInput,
    policyEntryPoint?: string,
  ): Promise<OpaResponse> {
    const opaBaseUrl = this.opaBaseUrl;
    const entryPoint = policyEntryPoint ?? this.policyEntryPoint;

    this.validateInputs(opaBaseUrl, entryPoint, input);

    const url = `${opaBaseUrl}/v1/data/${entryPoint}`;
    this.logger.debug(`Sent data to OPA: ${JSON.stringify(input)}`);

    try {
      const opaResponse = await this.sendRequest(url, input);
      return await this.handlePermissionResponse(opaResponse);
    } catch (error: unknown) {
      return this.handlePermissionError(error);
    }
  }

  private validateInputs(
    opaBaseUrl?: string,
    setEntryPoint?: string,
    input?: PolicyEvaluationInput | PermissionInput
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

  private async sendRequest(url: string, input: any): Promise<Response> {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });
  }

  private async handleResponse(
    opaResponse: Response,
    policyFallback?: OpaFallbackPolicy
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

  private async handlePermissionResponse(
    opaResponse: Response
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

  private handleFallback(
    message: string,
    policyFallback?: OpaFallbackPolicy
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

  private handleError(
    error: unknown,
    policyFallback?: OpaFallbackPolicy
  ): PolicyEvaluationResult {
    const message = `An error occurred while sending the policy input to the OPA server:`;

    if (error instanceof Error && error.name === 'FetchError') {
      return this.handleFallback(`${message} ${error}`, policyFallback);
    }
    this.logger.error(`${message} ${error}`);
    throw new Error(`${message} ${error}`);
  }

  private handlePermissionError(
    error: unknown
  ): OpaResponse {
    const message = `An error occurred while sending the policy input to the OPA server:`;

    this.logger.error(`${message} ${error}`);
    throw new Error(`${message} ${error}`);
  }
}