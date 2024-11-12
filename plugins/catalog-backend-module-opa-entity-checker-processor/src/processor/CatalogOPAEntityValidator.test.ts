import {Entity} from "@backstage/catalog-model";
import {CatalogOPAEntityValidator} from "./CatalogOPAEntityValidator";
import {mockServices} from "@backstage/backend-test-utils";
import {OpaEntityCheckResult} from "@parsifal-m/plugin-opa-backend/src/api/EntityCheckerApi";

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'my-component',
    annotations: {
      "backstage.io/location": "https://example.com",
    }
  },
};

const logger = mockServices.logger.mock();

describe('CatalogOPAEntityValidator', () => {
  it('never fails when the Entity Checker Api errors', async () => {
    const mockEntityCheckerApi = {
      checkEntity: jest.fn((): Promise<OpaEntityCheckResult> => Promise.reject("error"))
    };
    const processor = new CatalogOPAEntityValidator(logger, mockEntityCheckerApi)

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          "backstage.io/location": "https://example.com",
        },
      },
    });
  })

  it('adds annotation, when entity fails validation', async () => {
    const mockEntityCheckerApi = {
      checkEntity: jest.fn((): Promise<OpaEntityCheckResult> => Promise.resolve(
        {
          result: [
            {
              id: "metadata.tags",
              check_title: "metadata.tags",
              level: 'error',
              message: "You do not have any tags set!"
            }
          ]
        }
      ))
    };

    const processor = new CatalogOPAEntityValidator(logger, mockEntityCheckerApi)

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          "backstage.io/location": "https://example.com",
          'open-policy-agent/entity-checker-violations-error-count': '1',
          "open-policy-agent/entity-checker-violations-status": "error"
        },
      },
    });
  })

  it('adds multiple annotations for different levels', async () => {
    const mockEntityCheckerApi = {
      checkEntity: jest.fn((): Promise<OpaEntityCheckResult> => Promise.resolve(
        {
          result: [
            {
              id: "metadata.tags",
              check_title: "metadata.tags",
              level: 'error',
              message: "Error message 1"
            },
            {
              id: "metadata.description",
              check_title: "metadata.description",
              level: 'warning',
              message: "Warning message 1"
            },
            {
              id: "spec.owner",
              check_title: "spec.owner",
              level: 'error',
              message: "Error message 2"
            },
            {
              id: "metadata.links",
              check_title: "metadata.links",
              level: 'info',
              message: "Info message 1"
            },
          ]
        }
      ))
    };

    const processor = new CatalogOPAEntityValidator(logger, mockEntityCheckerApi);

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          "backstage.io/location": "https://example.com",
          'open-policy-agent/entity-checker-violations-error-count': '2',
          'open-policy-agent/entity-checker-violations-warning-count': '1',
          'open-policy-agent/entity-checker-violations-info-count': '1',
          "open-policy-agent/entity-checker-violations-status": "error"
        },
      },
    });
  });

})
