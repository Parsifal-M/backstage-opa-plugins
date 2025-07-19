# OPA Entity Checker Processor

A standalone Backstage catalog processor that automatically validates entity metadata during catalog ingestion using Open Policy Agent (OPA) policies. The processor adds validation status annotations to entities without blocking catalog operations, enabling API-driven governance and compliance workflows.

## How It Works

The OPA Entity Checker Processor integrates directly into Backstage's catalog processing pipeline:

1. **Automatic Validation**: When entities are imported, discovered, or updated, the processor automatically validates them against your OPA policies
2. **Non-blocking Processing**: Validation happens asynchronously without preventing entity ingestion
3. **Status Annotations**: Adds standardized annotations indicating validation status (`pass`, `info`, `warning`, or `error`)
4. **API Integration**: Enables querying entities by validation status through Backstage's catalog API

```yaml
# Example: Entity with validation annotation
metadata:
  annotations:
    open-policy-agent/entity-checker-validation-status: 'error'
```

This approach provides automatic governance without disrupting catalog operations, making validation results queryable for building dashboards, reports, and automated workflows.

> **Note**: The processor automatically skips validation for `location` and `user` entities as they are typically managed by external providers.

For more details, check out:

- [Quick Start Guide](./quick-start.md) - Get up and running quickly
- [Entity Checker Policy Examples](../opa-entity-checker/example-entity-checker-policy.md) - Common validation patterns
- [Entity Checker Local Development](../opa-entity-checker/local-development.md) - Development setup

## Standalone Design

The processor is completely independent and can be used without other OPA plugins:

- **Minimal dependencies**: Only requires OPA server and processor registration
- **Flexible deployment**: Can be enabled/disabled independently
- **Modular approach**: Use only the OPA functionality you need

## Use Cases

- **Governance**: Automatically ensure entities meet organizational standards
- **Compliance**: Validate security requirements and approval workflows
- **API Workflows**: Build tools using validation status via Backstage API
- **Team Accountability**: Query entities by ownership and validation status

## Configuration

```yaml
openPolicyAgent:
  baseUrl: 'http://localhost:8181'
  entityCheckerProcessor:
    enabled: true
    policyEntryPoint: 'entity_checker/violation'
```

> **Note**: The processor is disabled by default. Set `enabled: true` to activate validation.

**Status Determination**: The processor determines the final status based on the highest priority violation level found (`error` > `warning` > `info`). If no violations are found, the status is set to `pass`.

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
