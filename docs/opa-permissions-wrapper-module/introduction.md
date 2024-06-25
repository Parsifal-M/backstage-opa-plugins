![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper) ![NPM Downloads](https://img.shields.io/npm/dw/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper)

# Simplify Permissions with OPA in Backstage

Integrate dynamic policy management into your Backstage instance with the OPA Permissions Wrapper Module. This tool leverages [Open Policy Agent (OPA)](https://github.com/open-policy-agent/opa) for flexible, easy-to-update permissions management within the [Backstage Permission Framework](https://backstage.io/docs/permissions/overview).

- **Dynamic Policy Management:** Use OPA's [Rego language](https://www.openpolicyagent.org/docs/latest/policy-language/) for creating and managing policies without hardcoding them.
- **Instant Updates:** Modify your OPA policies on the fly without needing to redeploy your Backstage instance.
- **Empower Teams:** Allow teams to manage their own policies easily, without deep knowledge of TypeScript or Backstage internals.

For more details, check out:

- [Quick-start Guide](/opa-permissions-wrapper-module/quick-start.md)
- [Local Development Guide](/opa-permissions-wrapper-module/local-development.md)

## How It Works

The module enhances the Backstage Permission Framework by integrating with OPA for policy evaluation. It simplifies the process of permission checks:

1. Define permissions within the plugin.
2. The plugin sends permission and identity information to the Permission Framework backend.
3. The backend forwards this information to OPA.
4. OPA evaluates the request against your policies and returns a decision.

## Join The Community

This project is a part of the broader Backstage and Open Policy Agent ecosystems. Explore more about these communities:

- [Backstage Community](https://backstage.io)
- [Open Policy Agent Community](https://www.openpolicyagent.org)
- [Styra](https://www.styra.com)
- [Join OPA on Slack](https://slack.openpolicyagent.org/)
- [Backstage Discord](https://discord.com/invite/MUpMjP2)

## Learn More

- [Blog: Going Backstage with OPA](https://www.styra.com/blog/going-backstage-with-opa/)
- [Talk: Building Fine-Grained Access Control for Backstage with OPA](https://www.youtube.com/watch?v=N0n_czYo_kE&list=PLj6h78yzYM2P4KPyeDFexAVm6ZvfAWMU8&index=15&ab_channel=CNCF%5BCloudNativeComputingFoundation%5D)

## Get Involved

Your contributions can make this plugin even better. Fork the repository, make your changes, and submit a PR! If you have questions or ideas, reach out on [Mastodon](https://hachyderm.io/@parcifal).

## License

Licensed under the Apache 2.0 License.
