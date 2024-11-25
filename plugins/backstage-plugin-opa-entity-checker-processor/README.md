# Backstage OPA Backend Module Entity Processor

When it comes to validating entries the Backend and Frontend plugins are great combo to bring validation errors to the user. However, this doesn't allow you to have the big picture of hom many entities in your catalog have fail the validation.

Then you can search entities by annotation using the API and get a list of all the entities that fails the validation.

```http request
GET http://localhost:7007/api/catalog/entities/by-query?filter=metadata.annotations.open-policy-agent/entity-checker-violations-status=error
Content-Type: 'application/json'
Authorization: Bearer {{BACKSTAGE_TOKEN}}
```

## Why annotation and Not Status updates

Editing errors leads to new entities not to be process, which is not always what we want, some "warning" are acceptable and we do not want to break processing and add additional errors message since we already provide frontend plugin to display those error message in a nicer and mor compact way.

Unfortunate, adding status that is not of the Error type is not supported yet.

> The mechanics for how to emit custom statuses is not in place yet

https://backstage.io/docs/features/software-catalog/extending-the-model/#adding-a-new-status-item-type

## Further work

- Use the notification backend to notify owner of errors or warning on entities https://backstage.io/docs/notifications/
- Provide an analytics panel that can be added to a group to list their entities that failed validation
