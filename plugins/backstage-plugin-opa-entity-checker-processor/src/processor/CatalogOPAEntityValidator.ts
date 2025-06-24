import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import { merge } from 'lodash';
import { LoggerService } from '@backstage/backend-plugin-api';
import {
  EntityCheckerClient,
  countResultByLevel,
  determineOverallStatus,
} from '../client/EntityCheckerClient';
import { OpaEntityCheckResult } from '../types';

export const OPA_ENTITY_CHECKER_ANNOTATION =
  'open-policy-agent/entity-checker-validation-status';

/**
 * A Backstage catalog processor that validates entities against Open Policy Agent (OPA) policies.
 *
 * This processor integrates with an OPA-based entity checker to validate catalog entities
 * and adds compliance status annotations based on the validation results. It skips validation
 * for location and user entities as they are typically managed by external providers.
 *
 */
export class CatalogOPAEntityValidator implements CatalogProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly client: EntityCheckerClient,
  ) {}

  getProcessorName(): string {
    return 'CatalogOPAEntityValidator';
  }

  async preProcessEntity(entity: Entity): Promise<Entity> {
    if (['location', 'user'].includes(entity.kind.toLowerCase())) {
      return entity;
    }

    return await this.client
      .checkEntity({
        entityMetadata: entity,
      })
      .then((opaResult: OpaEntityCheckResult) => {
        this.logger.debug(
          `CatalogOPAEntityValidator Processing entity ${
            entity.metadata.name
          } result: ${JSON.stringify(opaResult)}`,
        );

        if (opaResult.result === undefined) {
          return entity;
        }

        const violationStats = countResultByLevel(opaResult.result);
        this.logger.debug(
          `CatalogOPAEntityValidator Violation Stats for entity ${
            entity.metadata.name
          } result:${JSON.stringify(violationStats)}`,
        );
        const annotations: { [name: string]: string } = {};

        annotations[`${OPA_ENTITY_CHECKER_ANNOTATION}`] =
          determineOverallStatus(violationStats, ['error', 'warning', 'info']);

        return merge(
          {
            metadata: {
              annotations: annotations,
            },
          },
          entity,
        );
      })
      .catch(() => {
        return entity;
      });
  }
}
