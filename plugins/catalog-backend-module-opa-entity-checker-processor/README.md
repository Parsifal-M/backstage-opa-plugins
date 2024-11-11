# Backstage OPA Backend Module Entity Processor

When it comes to validating entries the Backend and Frontend plugins are great combo to bring validation errors to the user. However, this doesn't allow you to have the big picture of hom many entities in your catalog have fail the validation.

This processor will analyse entities everytime they are ingested by backstage and add an annotation reflecting the value of `good_entity` in your validation.

Then you can search entities by annotation using the API and get a list of all the entities that fails the validation.

```http request
GET {backstage_host}/entities/by-query?filter=metadata.annotations.entity-checker.opa/good-entity=false
```

## Further work

* Use the notification backend to notify owner of errors or warning on entities https://backstage.io/docs/notifications/
* Provide an analytics panel that can be added to a group to list their entities that failed validation
