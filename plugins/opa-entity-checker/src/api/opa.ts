import axios from 'axios';

export async function evaluateMetadata(metadata: any): Promise<any> {
    const opaURL = 'http://localhost:7007/api/proxy/opa/backstage';

    try {
      const response = await axios.post(opaURL, {
          input: metadata,
      });

      return response.data.result;
  } catch (error) {
      throw new Error('Failed to evaluate metadata with OPA');
  }
}

