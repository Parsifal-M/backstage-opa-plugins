# Backstage OPA Authz React Plugin

> This Package is still being worked on and could contain breaking changes without notice. Please use with caution!

**A React component library for Backstage that enables frontend authorization using Open Policy Agent (OPA).**

## Overview

This plugin provides React components and hooks to control UI visibility and access based on OPA policy evaluations. Unlike the standard Backstage permissions framework, this library gives you direct control over authorization logic without requiring application rebuilds.

### Key Features

- 🔒 **Flexible Authorization** - Pass custom policy input data to OPA
- 🎯 **Component-Level Control** - Hide/show UI elements based on policies
- 🔧 **Framework Independent** - Works alongside or instead of Backstage permissions
- ⚡ **Performance Optimized** - Built with SWR for efficient caching and revalidation

### When to Use This Plugin

Use this library when you need:

- More context in authorization decisions than Backstage permissions provide
- To decouple authorization logic from your application code
- Fine-grained control over UI element visibility
- Custom plugins with flexible authorization patterns

You can wrap your components with the `RequireOpaAuthz` component to control the visibility of components based on the result of a policy evaluation.

The component uses the `useOpaAuthz` hook to perform the policy evaluation, and it will render the children only if the policy evaluation `allow` is `true`.

## Why Choose This Over Backstage Permissions?

While the Backstage Permissions framework works well for many cases, this library provides additional flexibility:

- **Custom Policy Input** - Send any data structure to OPA, not just predefined permission types
- **Decoupled Authorization** - Change authorization logic without rebuilding your application
- **Fine-Grained Control** - Perfect for custom plugins requiring specific authorization patterns
- **Direct OPA Integration** - Work directly with OPA policies without framework limitations

> **Note:** This library can work alongside the [OPA Permission Wrapper](../permission-backend-module-opa-wrapper/README.md) for comprehensive authorization coverage across your Backstage instance.

## Prerequisites

Before using this plugin, you need to install and configure the OPA backend plugin. See the [OPA Backend Plugin documentation](../backstage-opa-backend/README.md) for setup instructions.

## Installation

### 1. Install Required Packages

You'll need both the React plugin (frontend) and the OPA backend plugin:

```bash
# Install frontend plugin
yarn add --cwd packages/app @parsifal-m/backstage-plugin-opa-authz-react

# Install backend plugin (if not already installed)
yarn add --cwd packages/backend @parsifal-m/plugin-opa-backend
```

### 2. Configure the API

Add the OPA Authz API to your `packages/app/src/apis.ts` file:

```ts
export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  // Add the OPA Authz API
  createApiFactory({
    api: opaAuthzBackendApiRef,
    deps: {
      fetchApi: fetchApiRef,
    },
    factory: ({ fetchApi }) => new OpaAuthzClientReact({ fetchApi }),
  }),
  ScmAuth.createDefaultApiFactory(),
];
```

## Usage

### Option 1: RequireOpaAuthz Component (Recommended)

The `RequireOpaAuthz` component is the easiest way to control component visibility based on OPA policy evaluations.

```tsx
import { RequireOpaAuthz } from '@parsifal-m/backstage-plugin-opa-authz-react';

function MyProtectedComponent() {
  return (
    <RequireOpaAuthz
      input={{ action: 'read-policy', resource: 'catalog' }}
      entryPoint="authz"
    >
      <div>This content is only visible if the policy allows it!</div>
    </RequireOpaAuthz>
  );
}
```

**Props:**

- `input` - The data sent to OPA for policy evaluation
- `entryPoint` - The OPA policy entrypoint to evaluate
- `children` - Components to render when access is allowed

### Option 2: useOpaAuthz Hook (Advanced)

For more control over the authorization flow, use the hook directly. You can rename the destructured variables for clarity:

```tsx
import React from 'react';
import { useOpaAuthz } from '@parsifal-m/backstage-plugin-opa-authz-react';
import { useEntity } from '@backstage/plugin-catalog-react';

const EntityDeleteButton = () => {
  const { entity } = useEntity();

  const {
    loading: policyLoading,
    data: policyResult,
    error: policyError,
  } = useOpaAuthz(
    {
      action: 'delete',
      resource: 'catalog',
      entityRef: entity.metadata.name,
      entityKind: entity.kind,
    },
    'rbac',
  );

  if (policyLoading) {
    return <div>Checking delete permissions...</div>;
  }

  if (policyError) {
    return <div>Permission check failed: {policyError.message}</div>;
  }

  if (!policyResult?.result.allow) {
    return null; // Hide button if not allowed
  }

  return (
    <Button color="error" onClick={() => handleDelete(entity)}>
      Delete Entity
    </Button>
  );
};
```

### Option 3: useOpaAuthzManual Hook (Manual Control)

For scenarios where you need to trigger policy evaluation at specific times (e.g., after fetching user data):

```tsx
import React, { useEffect, useState } from 'react';
import { useOpaAuthzManual } from '@parsifal-m/backstage-plugin-opa-authz-react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

const ConditionalScaffolderAction = ({ templateRef }) => {
  const catalogApi = useApi(catalogApiRef);
  const [userGroups, setUserGroups] = useState([]);

  const {
    loading: authLoading,
    data: authResult,
    error: authError,
    evaluatePolicy,
  } = useOpaAuthzManual(
    {
      action: 'create',
      resource: 'scaffolder',
      template: templateRef,
      userGroups: userGroups, // Use state that gets updated
    },
    'rbac',
  );

  useEffect(() => {
    // Fetch user context first, then trigger policy evaluation
    const fetchUserAndEvaluate = async () => {
      try {
        const userEntity = await catalogApi.getEntityByRef(
          'user:default/current',
        );
        const groups =
          userEntity?.relations?.filter(r => r.type === 'memberOf') || [];
        const groupRefs = groups.map(g => g.targetRef);

        // Update state first - this will cause the hook's input to change
        setUserGroups(groupRefs);

        // Then trigger policy evaluation with the updated input
        await evaluatePolicy();
      } catch (error) {
        console.error('Failed to fetch user context:', error);
      }
    };

    fetchUserAndEvaluate();
  }, [catalogApi, evaluatePolicy, templateRef]);

  if (authLoading) return <div>Checking template permissions...</div>;
  if (authError) return <div>Permission check failed</div>;
  if (!authResult?.result.allow) return null;

  return (
    <Button onClick={() => handleScaffolding()}>Create from Template</Button>
  );
};
```

## Practical Example

Here's a simple example in a metaphorical plugin that allows you to deploy things, showing how to restrict deployment actions during business hours:

```tsx
import React from 'react';
import { Button } from '@material-ui/core';
import { RequireOpaAuthz } from '@parsifal-m/backstage-plugin-opa-authz-react';

export const DeploymentActions = ({ environment }) => {
  const currentHour = new Date().getHours();
  const isWeekday = new Date().getDay() >= 1 && new Date().getDay() <= 5;

  return (
    <div>
      <Button variant="outlined" color="primary">
        View Logs
      </Button>

      {/* Deploy button only shows if policy allows */}
      <RequireOpaAuthz
        input={{
          action: 'deploy',
          environment,
          hour: currentHour,
          isWeekday,
        }}
        entryPoint="deployment_policy"
      >
        <Button variant="contained" color="primary">
          Deploy to {environment}
        </Button>
      </RequireOpaAuthz>

      {/* Rollback always restricted during business hours */}
      <RequireOpaAuthz
        input={{
          action: 'rollback',
          environment,
          hour: currentHour,
          isWeekday,
        }}
        entryPoint="deployment_policy"
      >
        <Button variant="contained" color="secondary">
          Rollback
        </Button>
      </RequireOpaAuthz>
    </div>
  );
};
```

**OPA Policy Example** (`deployment_policy.rego`):

```rego
package deployment_policy

default allow = false

# Allow deployments to dev anytime
allow {
    input.action == "deploy"
    input.environment == "dev"
}

# Allow production deployments only outside business hours (6 PM - 8 AM)
allow {
    input.action == "deploy"
    input.environment == "production"
    not business_hours
}

# Never allow rollbacks during weekday business hours (9 AM - 5 PM)
allow {
    input.action == "rollback"
    not business_hours
}

business_hours {
    input.isWeekday
    input.hour >= 9
    input.hour < 17
}
```

This example demonstrates blocking dangerous operations during business hours - deployments and rollbacks are hidden when policies don't allow them, preventing accidental production changes during peak usage.

## Demo and Examples

For a complete working example, check out our [demo frontend plugin](../../plugins/opa-demo-frontend) that demonstrates practical usage patterns with the `RequireOpaAuthz` component.

## API Reference

### RequireOpaAuthz Component

| Prop         | Type          | Description                                                         |
| ------------ | ------------- | ------------------------------------------------------------------- |
| `input`      | `PolicyInput` | Data payload sent to OPA for policy evaluation                      |
| `entryPoint` | `string`      | OPA policy entry point to evaluate against                          |
| `children`   | `ReactNode`   | Content to render when policy allows access                         |
| `errorPage?` | `ReactNode`   | Optional content to show on loading/error states (defaults to null) |

### useOpaAuthz Hook

```tsx
const { loading, data, error } = useOpaAuthz(input, entryPoint);
```

**Returns:**

- `loading` - Boolean indicating if evaluation is in progress
- `data` - Policy evaluation result from OPA
- `error` - Error object if evaluation fails

### useOpaAuthzManual Hook

```tsx
const { loading, data, error, evaluatePolicy } = useOpaAuthzManual(
  input,
  entryPoint,
);
```

**Returns:** Same as `useOpaAuthz` plus:

- `evaluatePolicy` - Function to manually trigger policy evaluation using the current hook input

> **Note:** The `evaluatePolicy` function doesn't accept parameters. It uses the current `input` object passed to the hook. To evaluate with different data, update your state and the hook input will automatically update.

## Troubleshooting

### Common Issues

1. **"OPA API not configured"** - Ensure the OPA backend plugin is installed and the API is registered in `apis.ts`
2. **Policy evaluation fails** - Check that your OPA server is running and accessible
3. **Component not hiding** - Verify your policy returns `{ "allow": true/false }` structure

## Related Plugins

This plugin works well with other OPA plugins in the ecosystem:

- [OPA Backend Plugin](../backstage-opa-backend/README.md) - Required backend component
- [OPA Permission Wrapper](../permission-backend-module-opa-wrapper/README.md) - For Backstage permissions framework integration

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Sign your commits with `git commit -s`
5. Open a pull request

For significant changes, please open an issue first to discuss your proposal.

## License

This project is released under the Apache 2.0 License.
