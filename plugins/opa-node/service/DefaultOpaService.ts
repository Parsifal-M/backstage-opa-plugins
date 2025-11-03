import { OpaClient, PolicyInput, PolicyResult } from '../src/api/opaClient';

/**
 * OPA Service interface for evaluating policies.
 * 
 * @public
 */
export interface OpaService {
  /**
   * Evaluate a policy at the given entry point.
   * 
   * @param input - The policy input data
   * @param entryPoint - The OPA policy entry point d
   * @returns Promise resolving to the policy evaluation result
   */
  evaluatePolicy<T = PolicyResult>(
    input: PolicyInput,
    entryPoint: string,
  ): Promise<T>;
}

export class DefaultOpaService implements OpaService {
  private readonly opaClient: OpaClient;

  constructor(opaClient: OpaClient) {
    this.opaClient = opaClient;
  }

  static create(options: { baseUrl: string; logger: any }): DefaultOpaService {
    const opaClient = new OpaClient(options);
    return new DefaultOpaService(opaClient);
  }

  async evaluatePolicy<T = PolicyResult>(
    input: PolicyInput,
    entryPoint: string,
  ): Promise<T> {
    return this.opaClient.evaluatePolicy<T>(input, entryPoint);
  }
}