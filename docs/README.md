# Welcome to the OPA Plugins Repository for Backstage!

This repository contains a collection of plugins for [Backstage](https://backstage.io) that integrate with [Open Policy Agent](https://www.openpolicyagent.org/).

## Plugins

- [backstage-opa-backend](../plugins/backstage-opa-backend/README.md) - A Backend Plugin that the [backstage-opa-entity-checker](./plugins/backstage-opa-entity-checker/README.md) consumes to evaluate policies.
- [plugin-permission-backend-module-opa-wrapper](/opa-permissions-wrapper-module/introduction.md) - An isolated OPA Client and a Policy Evaluator that integrates with the Backstage permissions framework and uses OPA to evaluate policies, making it possible to use OPA for permissions (like RBAC).
- [backstage-opa-entity-checker](../plugins/backstage-opa-entity-checker/README.md) - A frontend plugin that provides a component card that displays if an entity has the expected entity metadata according to an opa policy.
- [backstage-opa-policies](../plugins/backstage-opa-policies/README.md) - A frontend component designed to be added to entity pages to fetch and display the OPA policy that entity uses based on a URL provided in an annotation in the `catalog-info.yaml` file.

## Policies

- [backstage-opa-policies](https://github.com/Parsifal-M/backstage-opa-policies#hello) - A collection of policies that can be used with the plugins in this repository. (WIP)

## Additional Documentation

Each plugin also has its own documentation in the README file in the plugin folder.

## Local Development

Step by step guide to developing locally:

1. Clone this repository
2. Create an `app-config.local.yaml` file in the root of the repository copying the contents from `app-config.yaml`
3. Create a PAT (Personal Access Token) for your GitHub account with these scopes: `read:org`, `read:user`, `user:email`. This token should be placed under `integrations.github.token` in the `app-config.local.yaml` file.
4. Run `yarn install --immutable` in the root of the repository
5. Use `docker-compose up -d` to start the OPA server and postgres database (this will also load the two policies in the `example-opa-policies` folder automatically)
6. Update the OPA rbac policy in here [rbac_policy.rego](./example-opa-policies/rbac_policy.rego), or use your own! If you want to use the default policy, you'll have to update `is_admin if "group:twocodersbrewing/maintainers" in claims` to what ever your user entity claims are.
7. Run `yarn dev` or `yarn debug` in the root of the repository to start the Backstage app (use debug if you want to see what is happening in the OPA plugin)

# Contributing

Contributions are welcome! However, still figuring out the best approach as this does require user and group entities to be in the system.

Please open an issue or a pull request. You can also contact me on mastodon at [@parcifal](https://hachyderm.io/@parcifal).

Please remember to sign your commits with `git commit -s` so that your commits are signed!
