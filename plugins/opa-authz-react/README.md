# OPA Authz React

This is a React component library for Backstage that provides a way to interact with an OPA (Open Policy Agent) server for Authorization in the frontend.

You can wrap your components with the `RequireOpaAuthz` component to control the visibility of components based on the result of a policy evaluation.

The component uses the `useOpaAuthz` to perform the policy evaluation, and it will render the children only if the policy evaluation `allow` is `true`.

## Why use this library?

Although the Backstage Permissions framework works well for most cases, sometimes you need to add a little more information to your policy input which is not available or possible in the framework. This library aims to provide a more generic way to interact with OPA, and can be used in any part of the Backstage application, and is not tied to the permissions framework in any way, meaning:

- Flexibility to pass your own policy input to OPA.
- Decouple the Authorization logic from the application meaning no rebuilding the application to change the authorization logic.

Sadly, not all core and community plugins will work with this library for permissions, so you can still use the [plugin-permission-backend-module-opa-wrapper](https://parsifal-m.github.io/backstage-opa-plugins/#/opa-permissions-wrapper-module/introduction) in conjunction with this library if needed which supports the permissions framework.
