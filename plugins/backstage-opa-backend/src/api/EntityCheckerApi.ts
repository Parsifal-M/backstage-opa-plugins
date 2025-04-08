import fetch from 'node-fetch';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Entity } from '@backstage/catalog-model';

export interface EntityCheckerApi {
  checkEntity(options: checkEntityOptions): Promise<OpaEntityCheckResult>;
}

export type checkEntityOptions = {
  entityMetadata: Entity;
};

export type EntityCheckerConfig = {
  logger: LoggerService;
  opaBaseUrl: string | undefined;
  entityCheckerEntrypoint: string | undefined;
};

export interface OpaEntityCheckResult {
  result?: OPAResult[];
}

export interface OPAResult {
  id?: string;
  check_title?: string;
  level: 'error' | 'warning' | 'info' | 'success';
  url?: string;
  decisionId?: string;
  message: string;
}

/**
 * countResultByLevel is a utility function that can be used tha generate statics about policy results
 * @param arr
 */
export function countResultByLevel(arr: OPAResult[]): Map<string, number> {
  return arr.reduce((acc: Map<string, number>, val) => {
    const count = acc.get(val.level) || 0;
    acc.set(val.level, count + 1);
    return acc;
  }, new Map<string, number>());
}

/**
 * determineOverallStatus is meant to be used in concision with countResultByLevel, the status is which ever >0 given a priority list
 * @param levelCounts
 * @param priorityOrder
 */
export function determineOverallStatus(
  levelCounts: Map<string, number>,
  priorityOrder: string[],
): string {
  for (const level of priorityOrder) {
    if (levelCounts.get(level) && levelCounts.get(level)! > 0) {
      return level;
    }
  }
  return 'pass'; // Default to 'pass'
}

export class EntityCheckerApiImpl implements EntityCheckerApi {
  constructor(private readonly config: EntityCheckerConfig) {
    const logger = this.config.logger;

    if (!config.opaBaseUrl) {
      logger.error('OPA URL not set or missing!');
      throw new Error('OPA URL not set or missing!');
    }

    if (!config.entityCheckerEntrypoint) {
      logger.error('OPA package not set or missing!');
      throw new Error('OPA package not set or missing!');
    }
  }

  async checkEntity(
    options: checkEntityOptions,
  ): Promise<OpaEntityCheckResult> {
    const logger = this.config.logger;
    const entityMetadata = options.entityMetadata;

    if (!entityMetadata) {
      logger.error('Entity metadata is missing!');
      throw new Error('Entity metadata is missing!');
    }

    const opaUrl = `${this.config.opaBaseUrl}/v1/data/${this.config.entityCheckerEntrypoint}`;
    logger.debug(
      `Sending entity metadata to OPA: ${JSON.stringify(entityMetadata)}`,
    );
    return await fetch(opaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: entityMetadata }),
    }).then(response => {
      return response.json() as Promise<OpaEntityCheckResult>;
    });
  }
}
