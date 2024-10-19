import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { z } from 'zod';
import express from 'express';
import Router from 'express-promise-router';
import { TodoListService } from './services/TodoListService/types';
import { Config } from '@backstage/config';
import {
  OpaAuthzClient,
  opaAuthzMiddleware,
} from '@parsifal-m/backstage-opa-authz';

export async function createRouter({
  todoListService,
  config,
  logger,
}: {
  httpAuth: HttpAuthService;
  config: Config;
  logger: LoggerService;
  todoListService: TodoListService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  // TEMPLATE NOTE:
  // Zod is a powerful library for data validation and recommended in particular
  // for user-defined schemas. In this case we use it for input validation too.
  //
  // If you want to define a schema for your API we recommend using Backstage's
  // OpenAPI tooling: https://backstage.io/docs/next/openapi/01-getting-started
  const todoSchema = z.object({
    title: z.string(),
    entityRef: z.string().optional(),
  });

  const opaAuthzClient = new OpaAuthzClient(logger, config);

  const entryPoint = 'opa_demo';
  // Define the input
  const setInput = (req: express.Request) => {
    const input = {
      method: req.method,
      path: req.path,
      body: req.body,
      params: req.params,
      plugin: 'todo-list',
    };

    // Log the input
    console.log(`OPA input: ${JSON.stringify(input)}`);

    return input;
  };

  router.post(
    '/todos',
    opaAuthzMiddleware(opaAuthzClient, entryPoint, setInput),
    async (req, res) => {
      const parsed = todoSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InputError(parsed.error.toString());
      }

      const result = await todoListService.createTodo(parsed.data);

      res.status(201).json(result);
    },
  );

  router.get(
    '/todos',
    opaAuthzMiddleware(opaAuthzClient, entryPoint, setInput),
    async (_req, res) => {
      res.json(await todoListService.listTodos());
    },
  );

  router.get(
    '/todos/:id',
    opaAuthzMiddleware(opaAuthzClient, entryPoint, setInput),
    async (req, res) => {
      res.json(await todoListService.getTodo({ id: req.params.id }));
    },
  );

  return router;
}
