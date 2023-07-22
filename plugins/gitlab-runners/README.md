# gitlab-runners

This plugin provides a way to view details of [GitLab Runners](https://docs.gitlab.com/runner/).

## Requirements

You need to set a proxy in `app-config.yml`:

```yaml
  '/gitlab-runners':
    target: https://gitlab.com/api/v4/runners
    changeOrigin: true
    allowedMethods: ['GET']
    headers:
      Authorization: Bearer {TOKEN}
```

The token should be an Access Token with the owner role and at least 'read' scope on the APIs.

## Setup

In your `Root.tsx` file, add the following:

```tsx
//...
<SidebarItem icon={DirectionsRunIcon} to="gitlab-runners" text="Gitlab Runners" />
//...
```
