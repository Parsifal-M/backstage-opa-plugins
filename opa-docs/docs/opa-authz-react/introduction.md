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

> **Note:** This library can work alongside the [OPA Permission Wrapper](../opa-permissions-wrapper-module/introduction) for comprehensive authorization coverage across your Backstage instance.

## Prerequisites

Before using this plugin, you need to install and configure the OPA backend plugin. See the [OPA Backend Plugin documentation](../opa-backend/introduction) for setup instructions.

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

## Practical Example

Here's a simple real-world example showing how to restrict deployment actions during business hours:

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

This example demonstrates blocking dangerous operations during business hours - deployments and rollbacks are hidden when policies don't allow them, preventing accidental production changes during peak usage.

## Demo and Examples

For a complete working example, check out our [demo frontend plugin](https://github.com/Parsifal-M/backstage-opa-plugins/tree/main/plugins/opa-demo-frontend) that demonstrates practical usage patterns with the `RequireOpaAuthz` component.

## Join The Community

This project is a part of the broader Backstage and Open Policy Agent ecosystems. Explore more about these communities:

- [Backstage Community](https://backstage.io)
- [Open Policy Agent Community](https://www.openpolicyagent.org)
- [Styra](https://www.styra.com)
- [Join OPA on Slack](https://slack.openpolicyagent.org/)
- [Backstage Discord](https://discord.com/invite/MUpMjP2)

## Get Involved

Your contributions can make this plugin even better. Fork the repository, make your changes, and submit a PR! If you have questions or ideas, reach out on [Mastodon](https://hachyderm.io/@parcifal).

## License

This project is licensed under the Apache 2.0 License.
