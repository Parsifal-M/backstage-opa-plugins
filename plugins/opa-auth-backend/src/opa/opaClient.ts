import { Config } from "@backstage/config";
import fetch from "node-fetch";

export class OpaClient {
  private readonly baseUrl: string;

  constructor(config: Config) {
    this.baseUrl = config.getString("integrations.opa.baseUrl");
  }

  async evaluatePolicy(policy: string, input: any): Promise<boolean> {
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
    return data.result as boolean;
  }
}