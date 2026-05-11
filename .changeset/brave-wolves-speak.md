---
'@parsifal-m/backstage-plugin-opa-node': minor
---

Refactored `OpaClient` from a concrete class into an interface, with `DefaultOpaClient` as the canonical implementation.

**Breaking change:** The `OpaClient` class has been renamed to `DefaultOpaClient`. If you were importing and instantiating `OpaClient` directly, update your imports:

```diff
- import { OpaClient } from '@parsifal-m/backstage-plugin-opa-node';
- const client = new OpaClient(config, logger);
+ import { DefaultOpaClient } from '@parsifal-m/backstage-plugin-opa-node';
+ const client = new DefaultOpaClient(config, logger);
```

Most users who only inject `opaService` are unaffected.
