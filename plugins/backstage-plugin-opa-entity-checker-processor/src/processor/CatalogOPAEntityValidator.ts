import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import { merge } from 'lodash';
import { LoggerService } from '@backstage/backend-plugin-api';

export const OPA_ENTITY_CHECKER_ANNOTATION =
  'open-policy-agent/entity-checker-validation-status';

export interface ValidationResult {
  id?: string;
  check_title?: string;
  level: 'error' | 'warning' | 'info' | 'success';
  url?: string;
  decisionId?: string;
  message: string;
}

export interface ValidationResponse {
  result?: ValidationResult[];
}

export type OpaConfig = {
  baseUrl: string;
  entrypoint: string;
};

/**
 * countResultByLevel is a utility function that can be used to generate statistics about validation results
 */
function countResultByLevel(arr: ValidationResult[]): Map<string, number> {
  return arr.reduce((acc: Map<string, number>, val) => {
    const count = acc.get(val.level) || 0;
    acc.set(val.level, count + 1);
    return acc;
  }, new Map<string, number>());
}

/**
 * determineOverallStatus is meant to be used in conjunction with countResultByLevel
 */
function determineOverallStatus(
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

export class CatalogOPAEntityValidator implements CatalogProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly opaConfig: OpaConfig,
  ) {}

  getProcessorName(): string {
    return 'CatalogOPAEntityValidator';
  }

  private async validateWithOpa(entity: Entity): Promise<ValidationResponse> {
    const opaUrl = `${this.opaConfig.baseUrl}/v1/data/${this.opaConfig.entrypoint}`;

    this.logger.debug(
      `Sending entity metadata to OPA: ${JSON.stringify(entity)}`,
    );

    const response = await fetch(opaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: entity }),
    });

    return response.json() as Promise<ValidationResponse>;
  }

  async preProcessEntity(entity: Entity): Promise<Entity> {
    // This processor doesn't validate:
    // * locations, those are not meant to be user facing as they originate from providers (GitLab, GitHub, etc.)
    // * Users, those are also meant to be added by external providers
    if (['location', 'user'].includes(entity.kind.toLowerCase())) {
      return entity;
    }

    try {
      const validationResult = await this.validateWithOpa(entity);

      this.logger.debug(
        `CatalogOPAEntityValidator Processing entity ${
          entity.metadata.name
        } result: ${JSON.stringify(validationResult)}`,
      );

      if (validationResult.result === undefined) {
        return entity;
      }

      // Determine and add the overall status annotation
      const validationStats = countResultByLevel(validationResult.result);
      this.logger.debug(
        `CatalogOPAEntityValidator Violation Stats for entity ${
          entity.metadata.name
        } result:${JSON.stringify(validationStats)}`,
      );

      const annotations: { [name: string]: string } = {};
      annotations[`${OPA_ENTITY_CHECKER_ANNOTATION}`] = determineOverallStatus(
        validationStats,
        ['error', 'warning', 'info', 'success'],
      );

      return merge(
        {
          metadata: {
            annotations: annotations,
          },
        },
        entity,
      );
    } catch (error) {
      this.logger.error(
        `Failed to validate entity ${entity.metadata.name}: ${error}`,
      );
      return entity;
    }
  }
}
