import {CatalogProcessor} from '@backstage/plugin-catalog-node';
import {Entity} from "@backstage/catalog-model";
import {merge} from 'lodash';
import {countResultByLevel, determineOverallStatus, EntityCheckerApi} from "@parsifal-m/plugin-opa-backend/src/api/EntityCheckerApi";
import {LoggerService} from "@backstage/backend-plugin-api";

const OPA_ENTITY_CHECKER_ANNOTATION_PREFIX = "open-policy-agent/entity-checker-violations"

export class CatalogOPAEntityValidator implements CatalogProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly api: EntityCheckerApi,
  ) {}

  getProcessorName(): string {
    return 'CatalogOPAEntityValidator';
  }

  async preProcessEntity(
    entity: Entity,
  ): Promise<Entity> {

   return await this.api.checkEntity({
      entityMetadata: JSON.stringify(entity)
    }).then((opaResult) => {
       // This processor doesn't validate locations, those are not meant to be user facing as they originate from providers (GitLab, GitHub, etc.)
       if (entity.kind.toLowerCase() === 'location') {
         return entity;
       }

        this.logger.debug(`CatalogOPAEntityValidator Processing entity ${entity.metadata.name} result: ${JSON.stringify(opaResult)}`)

        if (opaResult.result === undefined) {
          return entity
        }

        const violationStats = countResultByLevel(opaResult.result)
        this.logger.debug(`CatalogOPAEntityValidator Violation Stats for entity ${entity.metadata.name} result:${JSON.stringify(violationStats)}`)
        const annotations: { [name: string]: string } = {};
          violationStats.forEach((count, level) => {
           if (count > 0) { // Only add annotation if count is greater than 0
             annotations[`${OPA_ENTITY_CHECKER_ANNOTATION_PREFIX}-${level}-count`] = count.toString();
           }
         });

        // Determine and add the overall status annotation
        annotations[`${OPA_ENTITY_CHECKER_ANNOTATION_PREFIX}-status`] = determineOverallStatus(violationStats, ['error', 'warning', 'info']);

     return merge(
          {
            metadata: {
              annotations: annotations,
            }
          },
          entity
        )
    }).catch(() => {
      return entity
   })
  }
}
