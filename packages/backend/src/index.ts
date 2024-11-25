import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));
backend.add(import('@backstage/plugin-permission-backend/alpha'));
backend.add(import('@parsifal-m/plugin-permission-backend-module-opa-wrapper'));
backend.add(import('@parsifal-m/plugin-opa-backend'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));
backend.add(import('@internal/backstage-plugin-opa-demo-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-unprocessed'));
backend.add(
  import(
    '@parsifal-m/backstage-plugin-opa-entity-checker-processor'
  ),
);
backend.start();
