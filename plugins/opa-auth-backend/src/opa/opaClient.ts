import { Config } from "@backstage/config";
import { Logger } from "winston";
import fetch from "node-fetch";

export class OpaClient {
  private readonly baseUrl: string;
  private readonly logger: Logger;

  constructor(config: Config, logger: Logger) {
    this.baseUrl = config.getString("opa-auth-backend.opa.baseUrl");
    this.logger = logger;
  }

  async evaluatePolicy(policy: string, input: any): Promise<any> {
    this.logger.info(`Sending request to OPA server: ${this.baseUrl}/v1/data/${policy}`);
  
    const response = await fetch(`${this.baseUrl}/v1/data/${policy}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  
    if (!response.ok) {
      throw new Error(`Failed to evaluate policy, status=${response.status}`);
    }
  
    const data = await response.json();
    this.logger.info(`Received response from OPA server: ${JSON.stringify(data)}`);
  
    return data.result;
  }
}  

export function createOpaClient(config: Config, logger: Logger): OpaClient {
  return new OpaClient(config, logger);
}
