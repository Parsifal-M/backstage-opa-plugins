# Welcome to the OPA Plugins Repository for Backstage

[![codecov](https://codecov.io/gh/Parsifal-M/backstage-opa-plugins/graph/badge.svg?token=IHZGVSXZY7)](https://codecov.io/gh/Parsifal-M/backstage-opa-plugins)

This repository contains a collection of plugins for [Backstage](https://backstage.io) that integrate with [Open Policy Agent](https://www.openpolicyagent.org/).

## Blogs

- [Going Backstage with OPA](https://www.styra.com/blog/going-backstage-with-opa/)

## Talks

- [Can It Be Done? Building Fine-Grained Access Control for Backstage with OPA](https://www.youtube.com/watch?v=N0n_czYo_kE&list=PLj6h78yzYM2P4KPyeDFexAVm6ZvfAWMU8&index=15&ab_channel=CNCF%5BCloudNativeComputingFoundation%5D)

## Plugins

- [backstage-opa-backend](opa-backend/introduction.md#backstage-opa-backend-plugin) - A Backend Plugin that the [backstage-opa-entity-checker](opa-entity-checker/introduction.md#keep-your-entity-data-in-check-with-opa-entity-checker) consumes to evaluate policies.
- [plugin-permission-backend-module-opa-wrapper](opa-permissions-wrapper-module/introduction.md#simplify-permissions-with-opa-in-backstage) - An isolated OPA Client and a Policy Evaluator that integrates with the Backstage permissions framework and uses OPA to evaluate policies, making it possible to use OPA for permissions (like RBAC). Does not require the `backstage-opa-backend` plugin!
- [backstage-opa-entity-checker](opa-entity-checker/introduction.md#keep-your-entity-data-in-check-with-opa-entity-checker) - A frontend plugin that provides a component card that displays if an entity has the expected entity metadata according to an opa policy.
- [backstage-opa-policies](opa-policies/introduction.md#opa-policies-plugin-overview) - A frontend component designed to be added to entity pages to fetch and display the OPA policy that entity uses based on a URL provided in an annotation in the `catalog-info.yaml` file.

## Beta Plugins

- [backstage-opa-authz-react](opa-authz-react/introduction.md#opa-authz-react) - A frontend plugin that allows you to control the visibility of components based on the result of an OPA policy evaluation.
- [backstage-opa-authz](opa-authz/introduction.md#opa-authz-client) - A node library that includes an OPA client and middleware to evaluate policies, allowing you to control authorization in your backstage backend plugins using OPA.

## Policies

- [backstage-opa-policies](https://github.com/Parsifal-M/backstage-opa-policies#hello) - A collection of policies that can be used with the plugins in this repository. (WIP)

## Additional Documentation

Each Plugin has its own documentation in the [Plugins](https://github.com/Parsifal-M/backstage-opa-plugins/tree/main/plugins) Folder, I am however, slowly moving things to [Github pages](https://parsifal-m.github.io/backstage-opa-plugins/#/). Feel free to help out!

## Local Development

Step by step guide to developing locally:

1. Clone this repository
2. Create an `app-config.local.yaml` file in the root of the repository copying the contents from `app-config.yaml`
3. Create a PAT (Personal Access Token) for your GitHub account with these scopes: `read:org`, `read:user`, `user:email`. This token should be placed under `integrations.github.token` in the `app-config.local.yaml` file.
4. Run `yarn install --immutable` in the root of the repository
5. Use `docker-compose up -d` to start the OPA server and postgres database (this will also load the two policies in the `example-opa-policies` folder automatically)
6. Update the OPA rbac policy in here [rbac_policy.rego](https://github.com/Parsifal-M/backstage-opa-plugins/blob/main/policies/rbac_policy.rego), or use your own! If you want to use the default policy, you'll have to update `is_admin if "group:twocodersbrewing/maintainers" in claims` to what ever your user entity claims are.
7. Run `yarn dev` or `yarn debug` in the root of the repository to start the Backstage app (use debug if you want to see what is happening in the OPA plugin)

## Ecosystem

- [PlaTT Policy Template](https://github.com/ap-communications/platt-policy-template) contains policy templates that will work with the [plugin-permission-backend-module-opa-wrapper](opa-permissions-wrapper-module/introduction.md#simplify-permissions-with-opa-in-backstage) plugin!

## Contributing

Contributions are welcome! However, still figuring out the best approach as this does require user and group entities to be in the system.

Please open an issue or a pull request. You can also contact me on mastodon at [@parcifal](https://hachyderm.io/@parcifal).

Please remember to sign your commits with `git commit -s` so that your commits are signed!
