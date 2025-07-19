# Quick Start

This guide will help you get started with the OPA Entity Checker Processor module for Backstage.

## Pre-requisites

- You have deployed OPA, kindly see how to do that in the [OPA deployment documentation](https://www.openpolicyagent.org/docs/latest/deployments/).
- You have a Backstage instance running (v1.20.0 or higher recommended).
- Basic understanding of Rego policy language.

## Installation

Install the processor package in your Backstage backend:

```bash
yarn add --cwd packages/backend @parsifal-m/backstage-plugin-opa-entity-checker-processor
```

## Backend Setup

Add the processor module to your Backstage backend in `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// Standard Backstage plugins
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-catalog-backend/alpha'));

// Add the OPA Entity Checker Processor
backend.add(
  import('@parsifal-m/backstage-plugin-opa-entity-checker-processor'),
);

backend.start();
```

## Configuration

Add the processor configuration to your `app-config.yaml`:

```yaml
openPolicyAgent:
  baseUrl: 'http://localhost:8181'
  entityCheckerProcessor:
    enabled: true
    policyEntryPoint: 'entity_checker/violation'
```

> **Important**: The processor is **disabled by default**. You must explicitly set `enabled: true` to activate it.

## Example Policy

Create a simple Rego policy for entity validation. Here's a basic example:

```rego
# entity_checker.rego
package entity_checker

import rego.v1

# Component-specific validations
violation contains {
    "check_title": "Owner Required",
    "message": "All components must have an owner specified",
    "level": "error"
} if {
    input.kind == "Component"
    not input.spec.owner
}

violation contains {
    "check_title": "System Assignment",
    "message": "Components should belong to a system for better organization",
    "level": "warning"
} if {
    input.kind == "Component"
    not input.spec.system
}

# Lifecycle validation
violation contains {
    "check_title": "Invalid Lifecycle",
    "message": sprintf("Lifecycle '%s' is not valid. Use: production, development, or experimental", [input.spec.lifecycle]),
    "level": "error"
} if {
    input.kind == "Component"
    valid_lifecycles := {"production", "development", "experimental"}
    not valid_lifecycles[input.spec.lifecycle]
}
```

## Testing

Once configured, restart your Backstage backend. The processor will automatically validate entities during catalog ingestion and add validation status annotations:

```yaml
metadata:
  annotations:
    open-policy-agent/entity-checker-validation-status: "error" | "warning" | "info" | "pass"
```

> **Note**: The processor automatically skips validation for `location` and `user` entities as they are typically managed by external providers.

## Querying Results

Query entities by validation status using the Backstage API:

```bash
# Find all entities with validation errors
curl "http://localhost:7007/api/catalog/entities/by-query?filter=metadata.annotations.open-policy-agent/entity-checker-validation-status=error"

# Find all entities that passed validation
curl "http://localhost:7007/api/catalog/entities/by-query?filter=metadata.annotations.open-policy-agent/entity-checker-validation-status=pass"
```

## Configuration Options

| Setting                                   | Description                    | Required | Default                 |
| ----------------------------------------- | ------------------------------ | -------- | ----------------------- |
| `baseUrl`                                 | OPA server URL                 | Yes      | `http://localhost:8181` |
| `entityCheckerProcessor.enabled`          | Enable/disable the processor   | Yes      | `false`                 |
| `entityCheckerProcessor.policyEntryPoint` | OPA policy path for validation | Yes      | N/A                     |

## What's Next?

- [Introduction](./introduction.md) - Detailed overview and architecture
- [Policy Examples](./example-entity-checker-policy.md) - Advanced validation patterns
- [Local Development](./local-development.md) - Development environment setup
