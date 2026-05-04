# Contributing to Backstage OPA Plugins

Contributions are welcome! Please read this guide before opening a pull request.

## Local Development Setup

1. Clone this repository
2. Copy `app-config.yaml` to `app-config.local.yaml` in the repo root
3. Create a GitHub PAT with scopes `read:org`, `read:user`, `user:email` and set it under `integrations.github.token` in `app-config.local.yaml`
4. Run `yarn install --immutable`
5. Run `docker-compose up -d` to start OPA (port 8181) and a Postgres database — this mounts the policies in the `policies/` folder automatically. OPA runs with `--watch` so policy changes reload without restart.
6. Update the RBAC policy at [`policies/rbac_policy/rbac_policy.rego`](./policies/rbac_policy/) to match your user entity claims, or use your own policy
7. Run `yarn dev` to start Backstage, or `yarn debug` for verbose OPA plugin output

## Before Submitting a PR

- Sign your commits: `git commit -s`
- Run `yarn lint:all` and `yarn tsc` to check for lint and type errors
- Run `yarn test` to ensure all tests pass
- If your change affects a published package, run `yarn changeset` to add a changeset entry
- For larger changes, open an issue first to discuss the approach

## Reach Out

You can contact the maintainer on Mastodon at [@parcifal@hachyderm.io](https://hachyderm.io/@parcifal).
