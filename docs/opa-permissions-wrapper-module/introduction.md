![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper) ![NPM Downloads](https://img.shields.io/npm/dw/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper)

# OPA Permissions Wrapper Module for Backstage

This project is an [Open Policy Agent (OPA)](https://github.com/open-policy-agent/opa) wrapper for the [Backstage Permission Framework](https://backstage.io/docs/permissions/overview).

- Instead of coding policies directly into your Backstage instance with TypeScript, create, edit and manage your policies with OPA!

- Manage your policies in a more flexible way, you can use OPA's [Rego](https://www.openpolicyagent.org/docs/latest/policy-language/) language to write your policies.

- No need to redeploy your Backstage instance to update policies, simply update your OPA policies and you are good to go!

- Enable teams to manage their own policies, without needing to know TypeScript or the Backstage codebase!

See the following pages for more information:

- [OPA Permissions Quickstart](/opa-permissions-wrapper-module/quick-start.md)
- [OPA Permissions Local Development](/opa-permissions-wrapper-module/local-development.md)

## How It Works

This plugin wraps around the Backstage Permission Framework and uses the OPA client to evaluate policies. It will send a request to OPA with the permission and identity information, OPA will then evaluate the policy and return a decision, which is then passed back to the Permission Framework.

- Permissions are created in the plugin in which they need to be enforced.
- The plugin will send a request to the Permission Framework backend with the permission and identity information.
- The Permission Framework backend will then forward the request to OPA with the permission and identity information.
- OPA will evaluate the the information against the policy and return a decision.

## Community

This project is part of the Backstage and Open Policy Agent communities. For more information, please visit:

- [Backstage](https://backstage.io)
- [Open Policy Agent](https://www.openpolicyagent.org)
- [Styra](https://www.styra.com)
- [OPA Slack](https://slack.openpolicyagent.org/)
- [Backstage Discord](https://discord.com/invite/MUpMjP2)

## Blog Posts

- [Going Backstage with OPA](https://www.styra.com/blog/going-backstage-with-opa/)

## Talks

- [Can It Be Done? Building Fine-Grained Access Control for Backstage with OPA](https://www.youtube.com/watch?v=N0n_czYo_kE&list=PLj6h78yzYM2P4KPyeDFexAVm6ZvfAWMU8&index=15&ab_channel=CNCF%5BCloudNativeComputingFoundation%5D)

## License

This project is released under the Apache 2.0 License.
