# OPA Policies Plugin

This plugin will fetch and display the OPA Policy an entity consumes! This is useful for displaying the OPA Policy for an entity in the Backstage catalog.

![OPA Policy](../../docs/assets/opa-policies-plugin.png)

## Installation

You will need to install the backend plugin first into your `packages/backend` directory:

```bash
yarn add @parsifal-m/plugin-opa-backend
```

Then you will need to install the frontend plugin into your `packages/app` directory:

```bash
yarn add @parsifal-m/plugin-opa-policies
```

## Configuration

You need to add the following annotation to the entity you want to display the OPA Policy for:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage-testing-grounds
  description: An example of a Backstage application.
  annotations:
    # Add the OPA Policy URL here
    open-policy-agent/policy: https://github.com/Parsifal-M/backstage-testing-grounds/blob/main/rbac.rego
spec:
  type: website
  owner: john@example.com
  lifecycle: experimental
```

You need to provide the full URL to the OPA Policy file as above in order for the plugin to fetch and display it.

## Usage

You can then add it to your entity pages in `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import {
  OpaPolicyPage,
  isOpaPoliciesEnabled,
} from '@parsifal-m/plugin-opa-policies';

const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>
    // Other routes...
    <EntityLayout.Route
      if={isOpaPoliciesEnabled}
      path="/opa"
      title="Open Policy Agent"
    >
      <OpaPolicyPage />
    </EntityLayout.Route>
    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);
```

Note that using `isOpaPoliciesEnabled` will then only display the OPA Policy tab if the entity has the annotation set.

## Contributing

I am happy to accept contributions and suggestions for these plugins, if you are looking to make significant changes, please open an issue first to discuss the changes you would like to make!

Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal).

Please remember to sign your commits with `git commit -s` so that your commits are signed!

## License

This project is released under the Apache 2.0 License.
