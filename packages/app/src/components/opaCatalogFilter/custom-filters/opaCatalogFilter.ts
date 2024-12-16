import { EntityFilter } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { DefaultEntityFilters } from '@backstage/plugin-catalog-react';

export type CustomFilters = DefaultEntityFilters & {
  opaValidationStatus?: OpaValidationFilter;
};

export class OpaValidationFilter implements EntityFilter {
  constructor(readonly values: string[]) {}
  filterEntity(entity: Entity): boolean {
    const opaValidationStatus =
      entity.metadata.annotations?.[
        'open-policy-agent/entity-checker-validation-status'
      ];
    return (
      opaValidationStatus !== undefined &&
      this.values.includes(opaValidationStatus)
    );
  }
}
