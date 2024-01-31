# Open Policy Agent (OPA) Plugins Architecture

This document describes the high-level flow of interactions and the sequence diagram of the plugin interactions in the OPA plugins architecture.

## High-Level Flow of Interactions

```mermaid
graph LR
    A[Backstage] --> B[Permissions Framework]
    B --> C[OPA Permissions Wrapper Plugin]
    C --> D[OPA]
    D --> C
    C --> B
    B --> A
```

## Sequence Diagram of the Plugin Interactions (Old Backend)

This flowchart represents the high-level flow of interactions between the different components in the OPA plugins architecture.

```mermaid
sequenceDiagram
    participant User
    participant Backstage App
    participant permissions.ts
    box "permission-backend-module-opa-wrapper"
        participant policyEvaluator
        participant OpaClient
    end
    participant OPA Server

    User->>Backstage App: Makes a request
    Backstage App->>permissions.ts: Forward request
    permissions.ts->>policyEvaluator: evaluatePolicy(permissionRequest)
    policyEvaluator->>OpaClient: evaluatePolicy(permissionRequest)
    OpaClient->>OPA Server: POST /v1/data/{opaPackage}
    OPA Server-->>OpaClient: PolicyEvaluationResult
    OpaClient-->>policyEvaluator: Return PolicyEvaluationResult
    policyEvaluator-->>permissions.ts: Return evaluation result
    permissions.ts-->>Backstage App: Return evaluation result
    Backstage App-->>User: Return response
```

## Sequence Diagram of the Plugin Interactions (New Backend)

This flowchart represents the high-level flow of interactions between the different components in the OPA plugins architecture on the new backend system.

```mermaid
sequenceDiagram
    participant User
    participant Backstage App
    participant permission-backend-module-opa-wrapper
    participant opaClient
    participant OPA Server

    User->>Backstage App: Makes a request
    Backstage App->>permission-backend-module-opa-wrapper: evaluatePolicy(permissionRequest)
    permission-backend-module-opa-wrapper->>opaClient: evaluatePolicy(permissionRequest)
    opaClient->>OPA Server: POST /v1/data/{opaPackage}
    OPA Server-->>opaClient: PolicyEvaluationResult
    opaClient-->>permission-backend-module-opa-wrapper: Return evaluation result
    permission-backend-module-opa-wrapper-->>Backstage App: Return evaluation result
    Backstage App-->>User: Return response
```
