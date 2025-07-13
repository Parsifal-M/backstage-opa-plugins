---
"@parsifal-m/plugin-opa-backend": major
"@parsifal-m/plugin-opa-entity-checker": major
"@parsifal-m/backstage-plugin-opa-entity-checker-processor": major
"@parsifal-m/plugin-permission-backend-module-opa-wrapper": major
---

**BREAKING CHANGE: Configuration structure updated for all OPA plugins**

This release introduces breaking changes to the configuration structure across all OPA plugins. The configuration has been restructured to provide better separation of concerns and clearer organization.

## Migration Guide

### Permission Backend Module OPA Wrapper

**Old Configuration:**
```yaml
opaClient:
  baseUrl: 'http://localhost:8181'
  policies:
    permissions:
      entrypoint: 'rbac_policy/decision'
      policyFallback: 'allow'
```

**New Configuration:**
```yaml
permission:
  opa:
    baseUrl: 'http://localhost:8181'
    policies:
      permissions:
        entrypoint: 'rbac_policy/decision'
        policyFallback: 'allow'
```

### OPA Backend Services (Entity Checker, Policy Viewer)

**Old Configuration:**
```yaml
opaClient:
  baseUrl: 'http://localhost:8181'
  policies:
    entityChecker:
      entrypoint: 'entity_checker/violation'
```

**New Configuration:**
```yaml
openPolicyAgent:
  baseUrl: 'http://localhost:8181'
  entityChecker:
    enabled: true  # REQUIRED: Must be explicitly enabled
    policyEntryPoint: 'entity_checker/violation'  # Note: renamed from 'entrypoint'
  entityCheckerProcessor:
    enabled: true  # REQUIRED: Must be explicitly enabled  
    policyEntryPoint: 'entity_checker/violation'
  policyViewer:
    enabled: true  # REQUIRED: Must be explicitly enabled
```

## Key Changes

1. **Configuration Namespace Changes:**
   - Permission wrapper: `opaClient.*` → `permission.opa.*`
   - Backend services: `opaClient.*` → `openPolicyAgent.*`

2. **New Required `enabled` Flags:**
   - All OPA backend features are now **disabled by default**
   - You must explicitly set `enabled: true` for each feature you want to use

3. **Property Rename:**
   - `entrypoint` → `policyEntryPoint` (for backend services only)

## Required Actions

1. **Update your `app-config.yaml`** with the new configuration structure
2. **Add `enabled: true`** for all OPA backend features you want to use
3. **Update property names** (`entrypoint` → `policyEntryPoint` for backend services)
4. **Test your configuration** to ensure all features work as expected

## Benefits of This Change

- **Better organization:** Clear separation between permission framework and backend services
- **Resource optimization:** Only load the OPA features you actually need
- **Future-proof:** Better foundation for additional OPA features

## Troubleshooting

If OPA features are not working after upgrade:
1. Verify you've updated the configuration structure
2. Ensure `enabled: true` is set for features you want to use
3. Check that `policyEntryPoint` is correctly specified
4. Confirm OPA server connectivity with the new `baseUrl` locations
