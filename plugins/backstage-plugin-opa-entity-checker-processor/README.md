# Backstage OPA Backend Module Entity Processor

Using the [OPA Entity Checker](https://github.com/Parsifal-M/backstage-opa-plugins/tree/main/plugins/backstage-opa-entity-checker#opa-entity-checker) is a great way to display and help your Backstage users know when their entity metadata is incorrect, however by using this processor it will allow you to create a better overview of entities that have validation errors by adding the annotation to them

This allows you to, for example query the Backstage API for entities that have failed the policy validation

```http request
GET http://localhost:7007/api/catalog/entities/by-query?filter=metadata.annotations.open-policy-agent/entity-checker-validation-status=error
Content-Type: 'application/json'
Authorization: Bearer {{BACKSTAGE_TOKEN}}
```

## Why an annotation and not a status?

Editing errors leads to new entities not to be process, which is not always what we want, some "warning" are acceptable and we do not want to break processing and add additional errors message since we already provide frontend plugin to display those error message in a nicer and mor compact way.

Unfortunate, adding status that is not of the Error type is not supported yet.

> Its currently not possible to emit custom statuses in Backstage.

You can read more in the Backstage documentation regarding this [here](https://backstage.io/docs/features/software-catalog/extending-the-model/#adding-a-new-status-item-type)

## What's Next?

- [ ] Use the [Notification backend](https://backstage.io/docs/notifications/) to notify owner(s) of errors or warning on entities
- [ ] Provide an analytics panel that can be added to a group to list their entities that failed validation
- [x] Add an example Catalog Filter to be able to filter entities based on the status of the validation
      Example available here: [Example Catalog Filter](../../packages/app/src/components/opaCatalogFilter/README.md)
