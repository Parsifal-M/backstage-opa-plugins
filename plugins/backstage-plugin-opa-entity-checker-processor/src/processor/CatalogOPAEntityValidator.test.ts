import { Entity } from '@backstage/catalog-model';
import { CatalogOPAEntityValidator } from './CatalogOPAEntityValidator';
import { mockServices } from '@backstage/backend-test-utils';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-component',
    annotations: {
      'backstage.io/location': 'https://example.com',
    },
  },
};

const logger = mockServices.logger.mock();
const opaConfig = {
  baseUrl: 'http://opa.example.com',
  entrypoint: 'entity-checker',
};

global.fetch = jest.fn();

describe('CatalogOPAEntityValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('never fails when the Entity Checker Api errors', async () => {
    // Mock fetch to throw an error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const processor = new CatalogOPAEntityValidator(logger, opaConfig);

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          'backstage.io/location': 'https://example.com',
        },
      },
    });
  });

  it('adds annotation, when entity fails validation', async () => {
    // Mock fetch to return error validation results
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        result: [
          {
            level: 'error',
            message: 'Entity validation failed',
          },
        ],
      }),
    });

    const processor = new CatalogOPAEntityValidator(logger, opaConfig);

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          'backstage.io/location': 'https://example.com',
          'open-policy-agent/entity-checker-validation-status': 'error',
        },
      },
    });
  });

  it('adds warning annotations when it is the highest level', async () => {
    // Mock fetch to return warning validation results
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        result: [
          {
            level: 'warning',
            message: 'Entity has warnings',
          },
        ],
      }),
    });

    const processor = new CatalogOPAEntityValidator(logger, opaConfig);

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          'backstage.io/location': 'https://example.com',
          'open-policy-agent/entity-checker-validation-status': 'warning',
        },
      },
    });
  });

  it('returns entity unchanged when OPA returns no results', async () => {
    // Mock fetch to return empty results
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        result: undefined,
      }),
    });

    const processor = new CatalogOPAEntityValidator(logger, opaConfig);

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          'backstage.io/location': 'https://example.com',
        },
      },
    });
  });

  it('skips validation for location entities', async () => {
    const locationEntity: Entity = {
      ...entity,
      kind: 'Location',
    };

    const processor = new CatalogOPAEntityValidator(logger, opaConfig);

    expect(await processor.preProcessEntity(locationEntity)).toEqual(
      locationEntity,
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('skips validation for user entities', async () => {
    const userEntity: Entity = {
      ...entity,
      kind: 'User',
    };

    const processor = new CatalogOPAEntityValidator(logger, opaConfig);

    expect(await processor.preProcessEntity(userEntity)).toEqual(userEntity);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('prioritizes error over warning when both exist', async () => {
    // Mock fetch to return both error and warning validation results
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        result: [
          {
            level: 'warning',
            message: 'Entity has warnings',
          },
          {
            level: 'error',
            message: 'Entity validation failed',
          },
        ],
      }),
    });

    const processor = new CatalogOPAEntityValidator(logger, opaConfig);

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          'backstage.io/location': 'https://example.com',
          'open-policy-agent/entity-checker-validation-status': 'error',
        },
      },
    });
  });
});
