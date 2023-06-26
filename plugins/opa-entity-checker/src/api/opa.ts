import axios from 'axios';
import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';

export async function evaluateMetadata(entityMetadata: Entity, config: Config): Promise<any> {
    const packageName = config.getString("opa.packageName")
    const opaURL = `http://localhost:7007/api/proxy/opa/${packageName}`;

    try {
      const response = await axios.post(opaURL, {
          input: entityMetadata,
      });

      return response.data.result;
  } catch (error) {
      throw new Error('Failed to evaluate metadata with OPA');
  }
}

