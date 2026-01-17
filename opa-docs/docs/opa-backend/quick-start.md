# Quick Start

This guide will help you get started with the OPA Backend module for Backstage.

## Pre-requisites

- You have deployed OPA, kindly see how to do that [here](https://www.openpolicyagent.org/docs/latest/deployments/), or see below.

## Deploying OPA

There are many ways to deploy OPA, and there is no one size fits all. A good way is to deploy OPA as a sidecar to your Backstage instance. This way, you can ensure that OPA is always available when your Backstage instance is running.

Here is an example of how you could update your Backstage `k8s` deployment to include OPA, this would be an extension of the `k8s` deployment that you are using for your Backstage instance.

```yaml
#... Backstage deployment configuration with OPA
spec:
  containers:
    - name: backstage
      image: your-backstage-image
      ports:
        - name: http
          containerPort: 7007
    - name: opa
      image: openpolicyagent/opa:0.65.0 # Pin a version of your choice
      ports:
        - name: http
          containerPort: 8181
      args:
        - 'run'
        - '--server'
        - '--log-format=json-pretty'
        - '--set=decision_logs.console=true'
        - '--ignore=.*'
        - '--watch' # Watch for policy changes, this allows updating the policy without restarting OPA
        - '/policies'
      volumeMounts:
        - readOnly: true
          name: opa-policy
          mountPath: /policies
  volumes:
    - name: opa-policy
      configMap:
        name: opa-policy
```

## Installing The OPA Backend Plugin

Run the following command to install the OPA Backend Plugin in your Backstage project.

```bash
yarn --cwd packages/backend add @parsifal-m/plugin-opa-backend
```

Then make the following changes to the `packages/backend/src/index.ts` file in your Backstage project.

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
// ..... other plugins
backend.add(import('@parsifal-m/plugin-opa-backend'));
```

## Recommendations

I recommend using [Regal: A linter and language server for Rego](https://github.com/open-policy-agent/regal) to help you write your policies. It provides syntax highlighting, linting, and type checking for Rego files.
