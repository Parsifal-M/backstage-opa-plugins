# Open Policy Agent (OPA) Plugins Architecture

This document describes the high-level flow of interactions and the sequence diagram of the plugin interactions in the OPA plugins architecture.

## High-Level Flow of Interactions

```mermaid
graph LR
    A[Backstage] --> B[Permissions Framework]
    B --> C[OPA Permissions Wrapper Plugin]
    C --> D[OPA Backend Plugin]
    D --> E[OPA]
    E --> D
    D --> C
    C --> B
    B --> A
```

## Sequence Diagram of the Plugin Interactions

This flowchart represents the high-level flow of interactions between the different components in the OPA plugins architecture.

```mermaid

sequenceDiagram
    participant User
    participant Backstage App
    participant permissions.ts
    participant policyEvaluator
    participant OpaClient
    participant OPA Server

    User->>Backstage App: Makes a request
    Backstage App->>permissions.ts: Forward request
    permissions.ts->>policyEvaluator: evaluatePolicy(permissionRequest)
    policyEvaluator->>OpaClient: evaluatePolicy(permissionRequest)
    OpaClient->>OPA Server: POST /api/opa/opa-permissions/{opaPackage}
    OPA Server-->>OpaClient: PolicyEvaluationResult
    OpaClient-->>policyEvaluator: Return PolicyEvaluationResult
    policyEvaluator-->>permissions.ts: Return evaluation result
    permissions.ts-->>Backstage App: Return evaluation result
    Backstage App-->>User: Return response
```
