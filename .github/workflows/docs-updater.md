---
on:
  schedule: daily

permissions:
  contents: read
  pull-requests: read

engine: copilot

tools:
  github:
    toolsets: [context, repos, pull_requests]

network: defaults

safe-outputs:
  create-pull-request:
  push-to-pull-request-branch:

---

# docs-updater

Daily workflow that reviews recent code changes and opens a pull request to keep documentation in sync.

## Context

This is a Yarn monorepo (`backstage-opa-plugins`) containing published Backstage plugins that integrate Open Policy Agent (OPA) with Backstage. The repo structure is:

- `plugins/` — published plugins and modules
- `packages/app` / `packages/backend` — local dev Backstage app
- `opa-docs/` — Docusaurus documentation site (primary doc source)
- `policies/` — example Rego policies

Documentation lives primarily in:
- `opa-docs/docs/` — Docusaurus markdown pages
- `README.md` files inside each `plugins/*` directory
- The root `README.md`
- `AGENTS.md` — repo context for AI agents

## Instructions

1. **Identify recent changes**: Look at all commits merged to `main` in the last 24 hours. For each commit, collect the list of changed files and the commit message.

2. **Find documentation gaps**: For each set of code changes, determine whether any documentation is out of sync:
   - If a plugin's source files changed (`plugins/*/src/**`), check the corresponding `plugins/*/README.md` and `opa-docs/docs/` pages for that plugin. Look for outdated API descriptions, config examples, or feature descriptions.
   - If `app-config.yaml` or config-related source changed, check all docs that show configuration snippets — these go stale quickly.
   - If a new export was added or removed (check `plugins/*/src/index.ts`), the relevant README and docs page should reflect it.
   - If `AGENTS.md` references files, plugins, or config keys that no longer exist, update them.

3. **Assess impact**: Skip trivial changes (dependency bumps, changelog-only commits, test-only changes). Focus on changes that affect public API, configuration, or user-facing behaviour.

4. **Update documentation**: For each identified gap, make the minimum accurate change to bring docs in sync with the code. Do not rewrite or expand docs beyond what is needed — fix only what is wrong or missing.

5. **Open a pull request**:
   - Branch name: `docs/daily-sync-<YYYY-MM-DD>` (use today's date)
   - Title: `docs: sync documentation with recent changes (<date>)`
   - PR body: list each doc file changed, what changed, and which code commit triggered it
   - Label the PR `documentation` if that label exists in the repo

6. **Do nothing** if there are no relevant code changes in the last 24 hours, or if all docs are already accurate.

## Notes

- Commits must be signed (`git commit -s`) — the `push-to-pull-request-branch` output handles commit signing automatically.
- Only touch files under `opa-docs/docs/`, `plugins/*/README.md`, `README.md`, and `AGENTS.md`. Do not modify source code.
- If a doc update requires understanding Rego policy conventions, refer to `AGENTS.md` for the policy shape each plugin expects.
