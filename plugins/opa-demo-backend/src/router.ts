import {
  HttpAuthService,
  LoggerService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { z } from 'zod';
import express from 'express';
import Router from 'express-promise-router';
import { TodoListService } from './services/TodoListService/types';
import { OpaService } from '@parsifal-m/backstage-plugin-opa-node';
import {
  PolicyResult,
  PolicyInput,
} from '@parsifal-m/backstage-plugin-opa-common';
import { CatalogService } from '@backstage/plugin-catalog-node';

/**
 * OPA Demo Backend Router
 *
 * This router demonstrates how to use the OPA (Open Policy Agent) service for policy evaluation
 * in Backstage.
 *
 * Each endpoint sends a PolicyInput to OPA for evaluation against the 'opa_demo' policy entry point.
 * The policy result determines whether the request is allowed (403 Forbidden if denied).
 */

export async function createRouter({
  todoListService,
  logger,
  httpAuth,
  opa,
  catalog,
}: {
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  logger: LoggerService;
  todoListService: TodoListService;
  catalog: CatalogService;
  // The OPA service is injected here
  opa: OpaService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());
  const todoSchema = z.object({
    title: z.string(),
    entityRef: z.string().optional(),
  });

  // Here we are defining the OPA policy entry point we will be using for this plugin
  const entryPoint = 'opa_demo';

  router.post('/squads', async (req, res) => {
    // The example below shows what it could look like to send the user entity (name and annotations) to OPA
    // You can extract anything from the full user envelope as described here:
    // https://backstage.io/docs/features/software-catalog/descriptor-format
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const userEntityRef = credentials.principal.userEntityRef;
    const userEntity = await catalog.getEntityByRef(userEntityRef, {
      credentials,
    });

    // We're building an example policy input to send to OPA for evaluation
    const input: PolicyInput = {
      method: req.method,
      path: req.path,
      user: userEntity?.metadata.name,
      userAnnotations: userEntity?.metadata.annotations,
      permission: { name: 'post-todo' },
      plugin: 'opa-demo-backend-todo',
      dateTime: new Date().toISOString(),
    };

    try {
      const parsed = todoSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InputError(parsed.error.toString());
      }

      // This is just for the demo purposes so we can see what is being sent to OPA
      logger.info(`Sending input to OPA: ${JSON.stringify(input)}`);

      // Evaluate the policy using the OPA service
      const policyResult = await opa.evaluatePolicy<PolicyResult>(
        input,
        entryPoint,
      );

      // Check if access is allowed based on policy result, if not return 403
      if (!policyResult.result || !policyResult.result.allow) {
        return res.status(403).json({ error: 'Access Denied' });
      }

      const result = await todoListService.createTodo(parsed.data);
      return res.status(201).json(result);
    } catch (error: unknown) {
      if (logger) {
        logger.error(
          `An error occurred while sending the policy input to the OPA server: ${error}`,
        );
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/todos', async (_req, res) => {
    const credentials = await httpAuth.credentials(_req);
    const input = {
      method: _req.method,
      path: _req.path,
      headers: _req.headers,
      credentials: credentials,
      permission: { name: 'read-all-todos' },
      plugin: 'opa-demo-backend-todo',
    };

    // This is just for the demo purposes so we can see what is being sent to OPA
    logger.info(`Sending input to OPA: ${JSON.stringify(input)}`);

    try {
      const policyResult = await opa.evaluatePolicy<PolicyResult>(
        input,
        entryPoint,
      );

      // Check if access is allowed based on policy result
      if (!policyResult.result || !policyResult.result.allow) {
        return res.status(403).json({ error: 'Access Denied' });
      }

      // If allowed, proceed with the actual API call
      const todos = await todoListService.listTodos();

      return res.json(todos);
    } catch (error: unknown) {
      if (logger) {
        logger.error(
          `An error occurred while sending the policy input to the OPA server: ${error}`,
        );
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/todos/:id', async (_req, res) => {
    const credentials = await httpAuth.credentials(_req, { allow: ['user'] });
    const input = {
      method: _req.method,
      path: _req.path,
      headers: _req.headers,
      credentials: credentials,
      permission: { name: 'read-todo' },
      plugin: 'opa-demo-backend-todo',
      dateTime: new Date().toISOString(),
    };

    try {
      const policyResult = await opa.evaluatePolicy<PolicyResult>(
        input,
        entryPoint,
      );

      if (!policyResult.result || !policyResult.result.allow) {
        return res.status(403).json({ error: 'Access Denied' });
      }

      const result = await todoListService.getTodo({ id: _req.params.id });
      return res.json(result);
    } catch (error: unknown) {
      if (logger) {
        logger.error(
          `An error occurred while sending the policy input to the OPA server: ${error}`,
        );
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
