import {Entity} from "@backstage/catalog-model";
import {OpaResult} from "@parsifal-m/plugin-opa-entity-checker/src/api/types";
import {CatalogOPAEntityValidator} from "./CatalogOPAEntityValidator";

describe('CatalogOPAEntityValidator', () => {
  it('adds annotation, when entity fails validation', async () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
      },
    };

    const mockEntityCheckerApi = {
      checkEntity: jest.fn((): Promise<OpaResult> => Promise.resolve(
        {
          good_entity: false,
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

    const processor = new CatalogOPAEntityValidator(mockEntityCheckerApi)

    expect(await processor.preProcessEntity(entity)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
        annotations: {
          'entity-checker.opa/good-entity': 'false',
        },
      },
    });

  })
})
