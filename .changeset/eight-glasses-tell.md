---
'@parsifal-m/plugin-opa-entity-checker': minor
---

Adds new frontend system support via the `./alpha` entry point. Exports a `createFrontendPlugin` default with an `ApiBlueprint` (OPA client) and an `EntityCardBlueprint` (entity validation) — no `EntityPage.tsx` edits required in NFS apps.

Also replaces the bare dev app stub with a proper standalone dev setup using mocked API responses and entity context, so both card variants can be developed without a running backend.
