# Open Policy Agent (OPA) Plugins Architecture

This document describes the high-level flow of interactions and the sequence diagram of the plugin interactions in the OPA plugins architecture.

## High-Level Flow of Interactions

```mermaid
graph LR
    User([User]) --> Frontend[Backstage Frontend]
    Frontend -->|Permission Request| PermBackend[Permission Backend]
    PermBackend -->|Delegate| OPAWrapper[OPA Wrapper]
    OPAWrapper <-->|Policy Decision| OPA[OPA Server]
    style User fill:#f9f,stroke:#333,stroke-width:2px
    style OPA fill:#ff9,stroke:#333,stroke-width:2px
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
