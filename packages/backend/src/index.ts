import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(import('@parsifal-m/plugin-permission-backend-module-opa-wrapper'));
backend.add(import('@parsifal-m/plugin-opa-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));
backend.add(import('@backstage/plugin-techdocs-backend'));
backend.add(import('@internal/backstage-plugin-opa-demo-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-unprocessed'));
backend.add(
  import('@parsifal-m/backstage-plugin-opa-entity-checker-processor'),
);
backend.start();
