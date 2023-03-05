import fetch from 'node-fetch';

export class OpaClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async evaluatePolicy(input: any) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Failed to evaluate policy, status=${response.status}`);
    }

    const data = await response.json();
    return data.result.backstagedefault.allow;
    
  }
}
