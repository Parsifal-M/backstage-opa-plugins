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
    opaClient->>OPA Server: POST /v1/data/{opaEntryPoint}
    OPA Server-->>opaClient: PolicyEvaluationResult
    opaClient-->>permission-backend-module-opa-wrapper: Return evaluation result
    permission-backend-module-opa-wrapper-->>Backstage App: Return evaluation result
    Backstage App-->>User: Return response
```
