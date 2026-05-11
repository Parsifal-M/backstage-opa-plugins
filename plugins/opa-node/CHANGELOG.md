# @parsifal-m/backstage-plugin-opa-node

## 0.2.0

### Minor Changes

- d341c6d: Refactored `OpaClient` from a concrete class into an interface, with `DefaultOpaClient` as the canonical implementation.

  **Breaking change:** The `OpaClient` class has been renamed to `DefaultOpaClient`. If you were importing and instantiating `OpaClient` directly, update your imports:

  ```diff
  - import { OpaClient } from '@parsifal-m/backstage-plugin-opa-node';
  - const client = new OpaClient(config, logger);
  + import { DefaultOpaClient } from '@parsifal-m/backstage-plugin-opa-node';
  + const client = new DefaultOpaClient(config, logger);
  ```

  Most users who only inject `opaService` are unaffected.

## 0.1.4

### Patch Changes

- 644e665: Bumps core Backstage dependencies to 1.50.4.
- 129a32e: Adds a standalone dev setup (dev/index.ts) so the service can be run and tested in isolation without a full Backstage app.
- dc40942: chore: bump opa-node, fix workspace dep
- Updated dependencies [e273d1d]
  - @parsifal-m/backstage-plugin-opa-common@0.1.2

## 0.1.3

### Patch Changes

- Updated dependencies [923b236]
  - @parsifal-m/backstage-plugin-opa-common@0.1.1
