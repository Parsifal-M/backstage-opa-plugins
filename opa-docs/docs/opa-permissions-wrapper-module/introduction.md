![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper) ![NPM Downloads](https://img.shields.io/npm/dw/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper)

# Simplify Permissions with OPA in Backstage

:::tip
Does **NOT** require the `backstage-opa-backend` plugin!
:::

Integrate dynamic policy management into your Backstage instance with the OPA Permissions Wrapper Module. This tool leverages [Open Policy Agent (OPA)](https://github.com/open-policy-agent/opa) for flexible, easy-to-update permissions management within the [Backstage Permission Framework](https://backstage.io/docs/permissions/overview).

- **Dynamic Policy Management:** Use OPA's [Rego language](https://www.openpolicyagent.org/docs/latest/policy-language/) for creating and managing policies without hardcoding them.
- **Instant Updates:** Modify your OPA policies on the fly without needing to redeploy your Backstage instance.
- **Empower Teams:** Allow teams to manage their own policies easily, without deep knowledge of TypeScript or Backstage internals.

For more details, check out:

- [Quick-start Guide](/opa-permissions-wrapper-module/quick-start.md)
- [Local Development Guide](/opa-permissions-wrapper-module/local-development.md)

## How It Works

This plugin allows you to do two things, the first and foremost is to use it as a way to "wrap" around the Backstage Permission Framework and use the OPA client to evaluate policies. It will send a request to OPA with the permission and identity information, OPA will then evaluate the policy and return a decision, which is then passed back to the Permission Framework, in this scenario you don't need to do anything fancy, just install it and follow the configuration steps.

- Permissions are created in the plugin in which they need to be enforced.
- The plugin will send a request to the Permission Framework backend with the permission and identity information.
- The Permission Framework backend will then forward the request to OPA with the permission and identity information.
- OPA will evaluate the the information against the policy and return a decision.

You can also use the `evaluatePolicy` (see [here](/opa-permissions-wrapper-module/using-evalpolicy.md#using-evaluatepolicy)) function in your backend plugins to evaluate policies. This is useful if you want a bit more flexibility in how you pass the information to OPA and evaluate the policy. You can see an example of this in the [backend demo plugin](https://github.com/Parsifal-M/backstage-opa-plugins/blob/main/plugins/opa-demo-backend/src/router.ts).

## Join The Community

This project is a part of the broader Backstage and Open Policy Agent ecosystems. Explore more about these communities:

- [Backstage Community](https://backstage.io)
- [Open Policy Agent Community](https://www.openpolicyagent.org)
- [Join OPA on Slack](https://slack.openpolicyagent.org/)
- [Backstage Discord](https://discord.com/invite/MUpMjP2)

## Learn More

- [Blog: Going Backstage with OPA](https://www.styra.com/blog/going-backstage-with-opa/)
- [Talk: Building Fine-Grained Access Control for Backstage with OPA](https://www.youtube.com/watch?v=N0n_czYo_kE&list=PLj6h78yzYM2P4KPyeDFexAVm6ZvfAWMU8&index=15&ab_channel=CNCF%5BCloudNativeComputingFoundation%5D)

## Get Involved

Your contributions can make this plugin even better. Fork the repository, make your changes, and submit a PR! If you have questions or ideas, reach out on [Mastodon](https://hachyderm.io/@parcifal).

## Ecosystem

- [PlaTT Policy Template](https://github.com/ap-communications/platt-policy-template) contains policy templates that will work with the this plugin!

## License

Licensed under the Apache 2.0 License.
