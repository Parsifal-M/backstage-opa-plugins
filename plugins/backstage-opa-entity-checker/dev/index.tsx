import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { opaApiRef } from '../src/api';
import type { OpaBackendApi } from '../src/api/types';
import { OpaMetadataAnalysisCard } from '../src/components/OpaMetadataAnalysisCard';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-component',
    namespace: 'default',
    description: 'An example component for local dev testing',
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'guests',
    system: 'examples',
  },
};

const mockApiWithViolations: OpaBackendApi = {
  async entityCheck(_entity) {
    return {
      good_entity: false,
      result: [
        {
          check_title: 'Tags',
          level: 'warning',
          message: 'You do not have any tags set!',
        },
        {
          check_title: 'Type',
          level: 'error',
          message: 'Incorrect component type!',
        },
        {
          check_title: 'Description',
          level: 'info',
          message: 'Consider adding a description to improve discoverability.',
        },
      ],
    };
  },
};

const mockApiClean: OpaBackendApi = {
  async entityCheck(_entity) {
    return {
      good_entity: true,
      result: [],
    };
  },
};

createDevApp()
  .addPage({
    element: (
      <>
        <TestApiProvider apis={[[opaApiRef, mockApiWithViolations]]}>
          <EntityProvider entity={mockEntity}>
            <OpaMetadataAnalysisCard title="OPA Entity Checker (with violations)" />
          </EntityProvider>
        </TestApiProvider>
        <TestApiProvider apis={[[opaApiRef, mockApiClean]]}>
          <EntityProvider entity={mockEntity}>
            <OpaMetadataAnalysisCard title="OPA Entity Checker (no issues)" />
          </EntityProvider>
        </TestApiProvider>
      </>
    ),
    title: 'Default Variant',
    path: '/entity-checker',
  })
  .addPage({
    element: (
      <>
        <TestApiProvider apis={[[opaApiRef, mockApiWithViolations]]}>
          <EntityProvider entity={mockEntity}>
            <OpaMetadataAnalysisCard
              title="OPA Entity Checker (with violations)"
              variant="compact"
            />
          </EntityProvider>
        </TestApiProvider>
        <TestApiProvider apis={[[opaApiRef, mockApiClean]]}>
          <EntityProvider entity={mockEntity}>
            <OpaMetadataAnalysisCard
              title="OPA Entity Checker (no issues)"
              variant="compact"
            />
          </EntityProvider>
        </TestApiProvider>
      </>
    ),
    title: 'Compact Variant',
    path: '/entity-checker-compact',
  })
  .render();
