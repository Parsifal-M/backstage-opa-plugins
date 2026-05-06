import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { opaApiRef, OpaBackendApi, OpaPolicy } from '../src/api';
import { OpaPolicyPage } from '../src';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'petstore',
    namespace: 'default',
    annotations: {
      'open-policy-agent/policy':
        'https://raw.githubusercontent.com/Parsifal-M/backstage-opa-plugins/main/policies/rbac_policy.rego',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'guests',
  },
};

const mockOpaApi: OpaBackendApi = {
  async getPolicyFromRepo(_opaPolicy: string): Promise<OpaPolicy> {
    return {
      opaPolicyContent: `package rbac_policy

import future.keywords.if
import future.keywords.in

default allow := false

# Allow admins everything
allow if {
  "admin" in input.user.groups
}

# Allow users to view their own resources
allow if {
  input.action == "view"
  input.user.name == input.resource.owner
}`,
    };
  },
};

createDevApp()
  .addPage({
    element: (
      <TestApiProvider apis={[[opaApiRef, mockOpaApi]]}>
        <EntityProvider entity={mockEntity}>
          <OpaPolicyPage />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'OPA Policies',
    path: '/opa-policies',
  })
  .render();
