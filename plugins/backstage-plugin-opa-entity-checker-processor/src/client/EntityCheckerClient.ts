import {
  CheckEntityOptions,
  EntityCheckerConfig,
  OpaEntityCheckResult,
  OpaResult,
} from '../types';

export interface EntityCheckerClient {
  checkEntity(options: CheckEntityOptions): Promise<OpaEntityCheckResult>;
}

/**
 * Counts the number of OPA results grouped by their level.
 *
 * @param policyResult - An array of OpaResult objects to count by level
 * @returns A Map where keys are level strings and values are the count of results for each level
 *
 */
export function countResultByLevel(
  policyResult: OpaResult[],
): Map<string, number> {
  return policyResult.reduce((acc: Map<string, number>, val) => {
    const count = acc.get(val.level) || 0;
    acc.set(val.level, count + 1);
    return acc;
  }, new Map<string, number>());
}

/**
 * determineOverallStatus determines the overall status of an entity based on the counts of different levels.
 * It returns the first level in the priority order that has a count greater than zero.
 * If no levels have a count greater than zero, it defaults to 'pass'.
 *
 * @param levelCounts - A map containing counts of each level.
 * @param priorityOrder - An array defining the order of priority for levels. e.g., ['error', 'warning', 'info'].
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

/**
 * Implementation of the EntityCheckerClient interface that communicates with an OPA (Open Policy Agent) server
 * to validate entity metadata against configured policies.
 *
 * @remarks
 * This client validates entities by sending their metadata to an OPA server endpoint and receiving
 * validation results. The client requires both an OPA base URL and an entity checker entrypoint
 * to be configured.
 *
 */
export class EntityCheckerClientImpl implements EntityCheckerClient {
  constructor(private readonly config: EntityCheckerConfig) {}

  /**
   * Checks an entity against OPA (Open Policy Agent) policies.
   *
   * @param data - The data containing entity metadata to be checked
   * @param data.entityMetadata - The entity metadata to validate against OPA policies
   * @returns A promise that resolves to the OPA entity check result
   * @throws {Error} When entity metadata is missing or when OPA server communication fails
   *
   */
  async checkEntity(data: CheckEntityOptions): Promise<OpaEntityCheckResult> {
    const logger = this.config.logger;
    const entityMetadata = data.entityMetadata;

    if (!entityMetadata) {
      logger.error('Entity metadata is missing in the request!');
      throw new Error('Entity metadata is missing in the request!');
    }

    const opaUrl = `${this.config.opaBaseUrl}/v1/data/${this.config.entityCheckerEntrypoint}`;
    logger.debug(
      `Sending entity metadata to OPA: ${JSON.stringify(entityMetadata)}`,
    );

    try {
      const response = await fetch(opaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: entityMetadata }),
      });

      if (!response.ok) {
        const message = `OPA server returned error: ${response.status} - ${response.statusText}`;
        logger.error(message);
        throw new Error(message);
      }

      return (await response.json()) as OpaEntityCheckResult;
    } catch (error) {
      logger.error('Error communicating with OPA server:', error);
      throw error;
    }
  }
}
