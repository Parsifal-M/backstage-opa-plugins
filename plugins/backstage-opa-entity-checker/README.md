![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-opa-entity-checker?logo=npm)

# opa-entity-checker

Welcome to the opa-entity-checker plugin! This plugin uses [OPA](https://github.com/open-policy-agent/opa) to check your entities against a policy you set. It will then display the results of the check on the entity page. This is a good way to remind people of the data quality that is expected in your Backstage instance.

If you need help with OPA, you can find the documentation [here](https://www.openpolicyagent.org/docs/latest/).

## Pre-requisites

To use this plugin, you will first need to install the opa-backend plugin. Which can be found [here](../backstage-opa-backend/README.md).

## Installation

To add this plugin to Backstage, run the following command:

```bash
yarn add @parsifal-m/plugin-opa-entity-checker
```

## What does this do?

This plugin will allow you to run OPA against your entities in Backstage and see if they are compliant with your policies. You can choose between two components to display, a `compact` one or the `default`.

The `compact` version is intended to be used as a banner that displays how many errors were found, with a dropdown to see the details as you can see below:

![Compact MetaData Card Violations Closed](../../docs/assets/card-compact-closed.png)

Expanded, you can see the details of the violations:

![Compact MetaData Card Violations Open](../../docs/assets/card-compact-opened.png)

With the compact version, if there are no violations, the card will not be displayed.

The `default` version, currently looks like this:

![MetaData Card Violations](../../docs/assets/card1.png)

And with no violations:

![MetaData Card No Violations](../../docs/assets/card2.png)

## How do I set the policy?

The policy is set in the `app-config.yaml` file like so:

```yaml
openPolicyAgent:
  baseUrl: 'http://localhost:8181'
  entityChecker:
    enabled: true
    policyEntryPoint: 'entity_checker/violation'
```

> **Important:** The `entityChecker.enabled` flag must be set to `true` to activate the entity validation functionality. By default, it is **disabled** (`false`). This allows you to control whether entity validation is active in your Backstage instance.

Then in your OPA Policy (the `rego` file) you can use the following to set any violations you want to display (you do not have to use violation, you can use any rule head you want, but you will need to change the `entrypoint` in the `app-config.yaml` file to match the rule head you use):

```rego
package entity_checker

import future.keywords.contains
import future.keywords.if
import future.keywords.in

default good_entity := false

good_entity if {
 count({v | some v in violation; v.level == "error"}) == 0
}

violation contains {"check_title": entity_check, "message": msg, "level": "warning"} if {
 not input.metadata.tags
 entity_check := "Tags"
 msg := "You do not have any tags set!"
}

violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
 valid_lifecycles = {"production", "development"}
 not valid_lifecycles[input.spec.lifecycle]
 entity_check := "Lifecycle"
 msg := "Incorrect lifecycle, should be one of production or development"
}

violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
 not is_system_present
 entity_check := "System"
 msg := "System is missing!"
}

violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
 valid_types = {"website", "library", "service"}
 not valid_types[input.spec.type]
 entity_check := "Type"
 msg := "Incorrect component type!"
}

is_system_present if {
 input.spec.system
}
```

## Add The OPA Entity Checker Plugin To Your Frontend

Add the following to your `EntityPage.tsx` file:

```tsx
import {
  OpaMetadataAnalysisCard,
  hasOPAValidationErrors,
} from '@parsifal-m/plugin-opa-entity-checker';

//...

const overviewContent = (
  //...
  <EntitySwitch>
    <EntitySwitch.Case if={hasOPAValidationErrors}>
      <Grid item xs={6}>
        <OpaMetadataAnalysisCard />
      </Grid>
    </EntitySwitch.Case>
  </EntitySwitch>
  //...
);
```

You can also use the compact Card variant as follows. The card is intended to be used as a warning content banner.

```tsx
import {
    OpaMetadataAnalysisCard,
    hasOPAValidationErrors,
} from '@parsifal-m/plugin-opa-entity-checker';

const entityWarningContent = (
    //...
    <EntitySwitch>
      <EntitySwitch.Case if={hasOPAValidationErrors}>
        <Grid item xs={12}>
          <OpaMetadataAnalysisCard
            title="Entity Validation"
            variant="compact"
          />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
    //...
}
```

Although not mandatory, we recommend using the `<EntitySwitch>` in both the `default` and `compact` versions with `hasOPAValidationErrors` as this will then only display the cards if there are validation errors.

## Additional Information

Please see the [Docs Site](https://parsifal-m.github.io/backstage-opa-plugins/#/opa-entity-checker/introduction) for additional information on this plugin!

## Contributing

I am happy to accept contributions and suggestions for these plugins, if you are looking to make significant changes, please open an issue first to discuss the changes you would like to make!

Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal).

Please remember to sign your commits with `git commit -s` so that your commits are signed!

## License

This project is released under the Apache 2.0 License.
