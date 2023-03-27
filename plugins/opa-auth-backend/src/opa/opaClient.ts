import { Config } from "@backstage/config";
import fetch from "node-fetch";

export class OpaClient {
  private readonly baseUrl: string;

  constructor(config: Config) {
    // this.baseUrl = config.getString("integrations.opa.baseUrl");
    this.baseUrl = "http://localhost:8181";
  }

  async evaluatePolicy(policy: string, input: any): Promise<any> {
    console.log(`Sending request to OPA server: ${this.baseUrl}/v1/data/${policy}`);
  
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
    console.log(`Received response from OPA server: ${JSON.stringify(data)}`);
  
    return data.result;
  }
}  

export function createOpaClient(config: Config): OpaClient {
  return new OpaClient(config);
}
