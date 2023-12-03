# Welcome to the OPA Plugins Repository for Backstage!

This repository contains a collection of plugins for [Backstage](https://backstage.io) that integrate with [Open Policy Agent](https://www.openpolicyagent.org/).

## Plugins

- [backstage-opa-backend](./plugins/backstage-opa-backend/README.md) - A backend plugin that is used to connect to an OPA server and evaluate policies with provided endpoints.
- [backstage-opa-permissions-wrapper](./plugins/backstage-opa-permissions-wrapper/README.md) - A plugin that wraps the Backstage permissions framework and uses OPA to evaluate policies, making it possible to use OPA for permissions (like RBAC).
- [backstage-opa-entity-checker](./plugins/backstage-opa-entity-checker/README.md) - A frontend plugin that provides a component card that displays if an entity has the expected entity metadata according to an opa policy.

## Policies

- [backstage-opa-policies](https://github.com/Parsifal-M/backstage-opa-policies#hello) - A collection of policies that can be used with the plugins in this repository.


## Local Development

Step by step guide to developing locally:

1. Clone this repository
2. Create an `app-config.local.yaml` file in the root of the repository copying the contents from `app-config.yaml`
3. Create a PAT (Personal Access Token) for your GitHub account with these scopes: `read:org`, `read:user`, `user:email`. This token should be placed under `integrations.github.token` in the `app-config.local.yaml` file.
4. Run `yarn install --immutable` in the root of the repository
5. Use `docker-compose up -d` to start the OPA server and postgres database
6. Run `yarn dev` in the root of the repository to start the Backstage app


# Contributing

Contributions are welcome! However, still figuring out the best approach as this does require user and group entities to be in the system.

Please open an issue or a pull request. You can also contact me on mastodon at [@parcifal](https://hachyderm.io/@parcifal).