import { createBackend } from '@backstage/backend-defaults';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import Router from 'express-promise-router';
import { OpaClient } from '../src/opa-client/opaClient';
import { OpaPermissionPolicy } from '../src/policy';

// Minimal dev backend for @parsifal-m/plugin-permission-backend-module-opa-wrapper
// Requires a running OPA server at http://localhost:8181 with the rbac_policy loaded.
//
// Start: yarn workspace @parsifal-m/plugin-permission-backend-module-opa-wrapper start
//
// POST /api/opa-permission-wrapper-dev/evaluate
// Calls OpaPermissionPolicy.handle() directly — returns the raw OPA decision
// (ALLOW, DENY, or CONDITIONAL) with no permission framework restrictions.
//
// Basic permission (DENY — no matching rule for this permission, hits default):
//   curl -X POST http://localhost:7007/api/opa-permission-wrapper-dev/evaluate \
//     -H 'Content-Type: application/json' \
//     -d '{"permissionName": "scaffolder.task.create"}'
//
// Resource permission (CONDITIONAL — catalog.entity.read hits catalog_rules):
//   curl -X POST http://localhost:7007/api/opa-permission-wrapper-dev/evaluate \
//     -H 'Content-Type: application/json' \
//     -d '{"permissionName": "catalog.entity.read"}'
//
// Simulate admin (ALLOW — group:default/maintainers satisfies is_admin):
//   curl -X POST http://localhost:7007/api/opa-permission-wrapper-dev/evaluate \
//     -H 'Content-Type: application/json' \
//     -d '{"permissionName": "catalog.entity.read", "ownershipEntityRefs": ["group:default/maintainers"]}'
//
// The mock user defaults:
//   userEntityRef      = "user:default/mock"
//   ownershipEntityRefs = ["user:default/mock"]  (not admin)

const permissionWrapperDevPlugin = createBackendPlugin({
  pluginId: 'opa-permission-wrapper-dev',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        auth: coreServices.auth,
      },
      async init({ httpRouter, logger, config, auth }) {
        const opaClient = new OpaClient(config, logger);

        const router = Router();
        router.use(express.json());

        router.post('/evaluate', async (req, res) => {
          if (!req.body || typeof req.body.permissionName !== 'string') {
            res
              .status(400)
              .json({ error: 'permissionName (string) required in JSON body' });
            return;
          }

          const {
            permissionName,
            userEntityRef = 'user:default/mock',
            ownershipEntityRefs = ['user:default/mock'],
          }: {
            permissionName: string;
            userEntityRef?: string;
            ownershipEntityRefs?: string[];
          } = req.body;

          // Built per request so the simulated user's ownership refs come
          // from the request body via a stubbed UserInfo service.
          const policy = new OpaPermissionPolicy({
            opaClient,
            auth,
            userInfo: mockServices.userInfo({
              userEntityRef,
              ownershipEntityRefs,
            }),
            logger,
          });

          // OpaPermissionPolicy only reads permission.name — type fields are irrelevant here
          const result = await policy.handle(
            {
              permission: {
                type: 'basic',
                name: permissionName,
                attributes: {},
              },
            },
            {
              credentials: mockCredentials.user(userEntityRef),
              // Still required by the PolicyQueryUser type, but deprecated and
              // ignored by the policy, which resolves identity via userInfo.
              info: { userEntityRef, ownershipEntityRefs },
            },
          );

          res.json(result);
        });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/evaluate',
          allow: 'unauthenticated',
        });
      },
    });
  },
});

const backend = createBackend();

backend.add(mockServices.auth.factory());
backend.add(mockServices.httpAuth.factory());
backend.add(permissionWrapperDevPlugin);

backend.start();
