import axios from 'axios';
import { Entity } from '@backstage/catalog-model';

export async function evaluateMetadata(entityMetadata: Entity): Promise<any> {
    const opaURL = 'http://localhost:7007/api/proxy/opa/component';

    try {
      const response = await axios.post(opaURL, {
          input: entityMetadata,
      });

      return response.data.result;
  } catch (error) {
      throw new Error('Failed to evaluate metadata with OPA');
  }
}

