import axios from 'axios';
import { Entity } from '@backstage/catalog-model';

export async function evaluateMetadata(entityMetadata: Entity): Promise<any> {

    try {
      const response = await axios.post(`http://localhost:7007/api/proxy/entity-checker`, {
          input: entityMetadata,
      });

      return response.data.result;
  } catch (error) {
    console.error(error); 
      throw new Error('Failed to evaluate metadata with OPA');
  }
}