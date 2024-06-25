# Quick Start

This guide will help you get started with the OPA Policies plugin for Backstage.

## Pre-requisites

- You have installed the [OPA Backend Plugin](../opa-backend/introduction.md) in your Backstage instance.

## Installing The OPA Policies Plugin

Run the following command to install the OPA Backend Plugin in your Backstage project.

```bash
yarn add --cwd packages/backend @parsifal-m/plugin-opa-backend && yarn add --cwd packages/app @parsifal-m/plugin-opa-policies
```

Then make the following changes to the `packages/backend/src/index.ts` file in your Backstage project.

```diff
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-auth-backend'));
// ..... other plugins
+ backend.add(import('@parsifal-m/plugin-opa-backend'));
```

## Add The OPA Policies Plugin To Your Frontend

You can then add it to your entity pages in `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import {
  OpaPolicyPage,
  isOpaPoliciesEnabled,
} from '@parsifal-m/plugin-opa-policies';

const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>
    // Other routes...
    <EntityLayout.Route
      if={isOpaPoliciesEnabled}
      path="/opa"
      title="Open Policy Agent"
    >
      <OpaPolicyPage />
    </EntityLayout.Route>
    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);
```

> Note: Using `isOpaPoliciesEnabled` will then only display the OPA Policy tab if the entity has the annotation set.

## Configuration

You need to add the following annotation to the entity you want to display the OPA Policy for:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage-testing-grounds
  description: An example of a Backstage application.
  annotations:
    # Add the OPA Policy URL here
    open-policy-agent/policy: https://github.com/Parsifal-M/backstage-testing-grounds/blob/main/rbac.rego
spec:
  type: website
  owner: john@example.com
  lifecycle: experimental
```

You need to provide the full URL to the OPA Policy file as above in order for the plugin to fetch and display it.
