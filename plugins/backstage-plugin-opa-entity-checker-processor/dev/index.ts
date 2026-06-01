import { createBackend } from '@backstage/backend-defaults';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import Router from 'express-promise-router';
import { EntityCheckerClientImpl } from '../src/client/EntityCheckerClient';
import { CatalogOPAEntityValidator } from '../src/processor/CatalogOPAEntityValidator';

// Minimal dev backend for @parsifal-m/backstage-plugin-opa-entity-checker-processor
// Requires a running OPA server at http://localhost:8181 with the entity_checker policy loaded.
//
// Start: yarn workspace @parsifal-m/backstage-plugin-opa-entity-checker-processor start
//
// Send any entity to the processor and get back the annotated entity:
//   curl -X POST http://localhost:7007/api/opa-entity-checker-processor-dev/process \
//     -H 'Content-Type: application/json' \
//     -d '{
//       "apiVersion": "backstage.io/v1alpha1",
//       "kind": "Component",
//       "metadata": {"name": "my-component", "namespace": "default"},
//       "spec": {"type": "service", "lifecycle": "production", "owner": "user:default/mock", "system": "examples"}
//     }'
//
// The response is the entity with open-policy-agent/entity-checker-validation-status added.
// Omit tags, set an invalid lifecycle, or remove spec.system to trigger violations.

const processorDevPlugin = createBackendPlugin({
  pluginId: 'opa-entity-checker-processor-dev',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, logger, config }) {
        const opaBaseUrl =
          config.getOptionalString('openPolicyAgent.baseUrl') ??
          'http://localhost:8181';
        const entityCheckerEntrypoint =
          config.getOptionalString(
            'openPolicyAgent.entityCheckerProcessor.policyEntryPoint',
          ) ?? 'entity_checker/violation';

        const client = new EntityCheckerClientImpl({
          logger,
          opaBaseUrl,
          entityCheckerEntrypoint,
        });

        const processor = new CatalogOPAEntityValidator(logger, client);

        const router = Router();
        router.use(express.json());

        router.post('/process', async (req, res) => {
          const entity = req.body;
          const result = await processor.preProcessEntity(entity);
          res.json(result);
        });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/process',
          allow: 'unauthenticated',
        });
      },
    });
  },
});

const backend = createBackend();

backend.add(mockServices.auth.factory());
backend.add(mockServices.httpAuth.factory());
backend.add(processorDevPlugin);

backend.start();
