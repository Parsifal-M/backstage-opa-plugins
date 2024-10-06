import { FetchApi } from "@backstage/core-plugin-api";
import { OpaAuthzApi, PolicyInput, PolicyResult } from "./types";


export class OpaAuthzClientReact implements OpaAuthzApi {
  private readonly fetchApi: FetchApi;
  constructor(options: { fetchApi: FetchApi }) {
    this.fetchApi = options.fetchApi;
  }

  async evalPolicy(input: PolicyInput, entryPoint: string): Promise<PolicyResult> {
    const url = `plugin://opa/opa-authz`;

    const response = await this.fetchApi.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, entryPoint }),
    });

    if (!response.ok) {
      const message = `Error ${response.status}: ${response.statusText}.`;

      try {
        const responseBody = await response.json();
        throw new Error(
          `${message} Details: ${
            responseBody.error || 'No additional details provided.'
          }`,
        );
      } catch (error) {
        throw new Error(message);
      }
    }
    return response.json();
  }
}