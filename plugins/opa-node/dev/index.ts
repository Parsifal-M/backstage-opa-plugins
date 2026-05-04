import { createBackend } from '@backstage/backend-defaults';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import Router from 'express-promise-router';
import { opaService } from '../src';

// Minimal dev backend for @parsifal-m/backstage-plugin-opa-node
// Requires a running OPA server at http://localhost:8181
//
// Start: yarn start (from this plugin directory)
//
// Evaluate a policy:
//   curl -X POST http://localhost:7007/api/opa-node-dev/evaluate \
//     -H 'Content-Type: application/json' \
//     -d '{"input": {"action": "read"}, "entryPoint": "my_policy/decision"}'

const opaDevPlugin = createBackendPlugin({
  pluginId: 'opa-node-dev',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        opa: opaService,
      },
      async init({ httpRouter, opa }) {
        const router = Router();
        router.use(express.json());

        router.post('/evaluate', async (req, res) => {
          const { input, entryPoint } = req.body;
          const result = await opa.evaluatePolicy(input, entryPoint);
          res.json(result);
        });

        httpRouter.use(router);
      },
    });
  },
});

const backend = createBackend();
backend.add(mockServices.auth.factory());
backend.add(mockServices.httpAuth.factory());
backend.add(opaDevPlugin);
backend.start();
