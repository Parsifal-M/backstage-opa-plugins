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
import { Config } from '@backstage/config';
import { OpaClient } from '@parsifal-m/plugin-permission-backend-module-opa-wrapper';

export async function createRouter({
  todoListService,
  config,
  logger,
  httpAuth,
}: {
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  config: Config;
  logger: LoggerService;
  todoListService: TodoListService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());
  const todoSchema = z.object({
    title: z.string(),
    entityRef: z.string().optional(),
  });
  const opaClient = new OpaClient(config, logger);
  const entryPoint = 'opa_demo';

  router.post('/todos', async (_req, res) => {
    const credentials = await httpAuth.credentials(_req, { allow: ['user'] });
    const input = {
      method: _req.method,
      path: _req.path,
      headers: _req.headers,
      credentials: credentials,
      permission: { name: 'post-todo' },
      plugin: 'opa-demo-backend-todo',
      dateTime: new Date().toISOString(),
    };

    try {
      const parsed = todoSchema.safeParse(_req.body);
      if (!parsed.success) {
        throw new InputError(parsed.error.toString());
      }

      const policyResult = await opaClient.evaluatePolicy(input, entryPoint);

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
    const credentials = await httpAuth.credentials(_req, { allow: ['none'] });
    const input = {
      method: _req.method,
      path: _req.path,
      headers: _req.headers,
      credentials: credentials,
    };

    console.log(`sending input to opa`, JSON.stringify(input));

    try {
      const policyResult = await opaClient.evaluatePolicy(input, entryPoint);

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
      const policyResult = await opaClient.evaluatePolicy(input, entryPoint);

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
