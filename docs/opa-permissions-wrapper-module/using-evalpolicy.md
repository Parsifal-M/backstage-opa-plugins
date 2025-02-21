## Using `evaluatePolicy`

A good way to see this in action is to look at the [backend demo plugin](https://github.com/Parsifal-M/backstage-opa-plugins/blob/main/plugins/opa-demo-backend/src/router.ts). This plugin uses the `evaluatePolicy` function to evaluate policies.

Note, we always assume that the user is authenticated at this point, OPA does not handle authentication, it only handles authorization.

```typescript
router.post('/todos', async (_req, res) => {
  // Get the credentials from the request
  const credentials = await httpAuth.credentials(_req, { allow: ['user'] });

  // The entrypoint of the policy
  const entryPoint = 'opa_demo';

  // Create the input object (this is what will be sent to OPA)
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

    // Evaluate the policy
    const policyResult = await opaClient.evaluatePolicy(input, entryPoint);

    // If the policy does not allow the request, return a 403 (or handle it however you want)
    if (!policyResult.result || !policyResult.result.allow) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    // If the policy allows the request, create the todo
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
```

## Questions?

Feel free to create an issue or reach out to me!
