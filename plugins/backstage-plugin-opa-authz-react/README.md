# OPA Authz React

> This Package is still being worked on and could contain breaking changes without notice. Please use with caution!

This is a React component library for Backstage that provides a way to interact with an OPA (Open Policy Agent) server for Authorization in the frontend.

You can wrap your components with the `RequireOpaAuthz` component to control the visibility of components based on the result of a policy evaluation.

The component uses the `useOpaAuthz` hook to perform the policy evaluation, and it will render the children only if the policy evaluation `allow` is `true`.

## Why use this library?

Although the Backstage Permissions framework works well for most cases, sometimes you need to add a little more information to your policy input which is not available or possible in the framework. This library aims to provide a more generic way to interact with OPA, and can be used in any part of the Backstage application, and is not tied to the permissions framework in any way, meaning:

- Flexibility to pass your own policy input to OPA.
- Decouple the Authorization logic from the application meaning no rebuilding the application to change the authorization logic.
- More control over the Authorization logic for your own plugins.

Sadly, not all core and community plugins will work with this library for permissions, so you can still use the [plugin-permission-backend-module-opa-wrapper](https://parsifal-m.github.io/backstage-opa-plugins/#/opa-permissions-wrapper-module/introduction) in conjunction with this library if needed which supports the permissions framework.

## Pre-requisites

To use this plugin, you will first need to install the opa-backend plugin. Which can be found [here](../backstage-opa-backend/README.md).

## Quick Start

### Installation

Run the yarn install command! You'll need the `@parsifal-m/backstage-plugin-opa-authz-react` package for the frontend and the `@parsifal-m/plugin-opa-backend` package for the backend!

````bash
yarn add --cwd packages/app @parsifal-m/backstage-plugin-opa-authz-react && yarn add --cwd packages/backend @parsifal-m/plugin-opa-backend
```add --cwd packages/app @parsifal-m/backstage-plugin-opa-authz-react
````

### Add the API

In your `app/src/apis.ts` file, add the following:

```ts
export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  // Add the OPA Authz API
  createApiFactory({
    api: opaAuthzBackendApiRef,
    deps: {
      fetchApi: fetchApiRef,
    },
    factory: ({ fetchApi }) => new OpaAuthzClientReact({ fetchApi }),
  }),
  ScmAuth.createDefaultApiFactory(),
];
```

### Using the `RequireOpaAuthz` component

To control and hide a component based on the result of a policy evaluation, you can use the `RequireOpaAuthz` component.

Install the library first to your Backstage plugin:

```bash
yarn add --cwd <your-plugin-directory> @parsifal-m/backstage-plugin-opa-authz-react
```

Make sure you also have the backend plugin `@parsifal-m/plugin-opa-backend` installed and configured in your Backstage app!

Then, you can use the `RequireOpaAuthz` component in your React components like this:

```tsx
import { RequireOpaAuthz } from '@parsifal-m/backstage-plugin-opa-authz-react';

// Some code...

return (
  <RequireOpaAuthz input={{ action: 'read-policy' }} entryPoint="authz">
    <MyComponent />
  </RequireOpaAuthz>
);
```

The above will render `MyComponent` only if the policy evaluation `allow` is `true`. It will send to OPA the input `{ action: 'read-policy' }` and the entry point `authz`.

### Using the `useOpaAuthz` hook directly (optional)

If you want to use the `useOpaAuthz` hook directly, you can do so:

```tsx
import React from 'react';
import { useOpaAuthz } from '@parsifal-m/backstage-plugin-opa-authz-react';

const MyComponent = () => {
  const { loading, data, error } = useOpaAuthz(
    { action: 'read-policy' },
    'authz',
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !data?.result.allow) {
    return <div>Access Denied</div>;
  }

  return <div>Content</div>;
};
```

### Alternative to using the `useOpaAuthz` you can use `useOpaAuthzManual` hook (also optional)

If you need more control over when the policy evaluation is triggered, you can use the `useOpaAuthzManual` hook. This hook provides a `triggerFetch` function that allows you to manually trigger the policy evaluation:

```tsx
import React, { useEffect } from 'react';
import { useOpaAuthzManual } from '@parsifal-m/backstage-plugin-opa-authz-react';

const MyComponent = () => {
  const [userData, setUserData] = React.useState(null);
  const { loading, data, error, triggerFetch } = useOpaAuthzManual(
    { action: 'read-policy' },
    'authz',
  );

  useEffect(() => {
    const fetchData = async () => {
      // First fetch some user data
      const response = await fetch('/api/user-data');
      const userData = await response.json();
      setUserData(userData);

      // Then evaluate the policy with the fetched data
      const result = await triggerFetch();
      if (result?.result.allow) {
        // Do something when access is granted
      }
    };

    fetchData();
  }, [triggerFetch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !data?.result.allow) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <div>User Data: {JSON.stringify(userData)}</div>
      <div>Content</div>
    </div>
  );
};
```

The main difference between `useOpaAuthz` and `useOpaAuthzManual` is that the manual version won't automatically fetch the policy evaluation when the component mounts. Instead, it provides a `triggerFetch` function that you can call whenever you want to evaluate the policy, such as after fetching some data that might be needed for the policy evaluation.

## Example Demo Plugin(s)

To help visualize how this library can be used, we have created a demo plugin that demonstrates how to use the `RequireOpaAuthz` component in the frontend, you can find the demo code [here](../../plugins/opa-frontend-demo).

## Contributing

I am happy to accept contributions and suggestions for these plugins, if you are looking to make significant changes, please open an issue first to discuss the changes you would like to make!

Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal).

Please remember to sign your commits with `git commit -s` so that your commits are signed!

## License

This project is released under the Apache 2.0 License.
