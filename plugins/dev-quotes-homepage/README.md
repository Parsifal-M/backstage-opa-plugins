# dev-quotes-homepage

Hello! :wave:

This is just a fun little plugin that I made to display some random coding/progamming related quotes on the Backstage homepage. Although to be honest the card can be used anywhere you like!

## Pre-requisites (if you want to use it on the homepage)

If you do want to use it on the homepage, first make sure you look over the official docs on how to configure the homepage [here](https://backstage.io/docs/getting-started/homepage/#composing-your-homepage). There is also the [homepage plugin](https://github.com/backstage/backstage/tree/master/plugins/home#readme) which might be better to read first.

## Installation

```bash
yarn add --cwd packages/app @parsifal-m/plugin-dev-quotes-homepage
```

Then all you need to do is import the card as below, anywhere you like!

```tsx
import { DevQuote } from '@parsifal-m/plugin-dev-quotes-homepage';

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    {entityWarningContent}
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem" />
    </Grid>
    <Grid item md={6} xs={12}>
      <EntityCatalogGraphCard variant="gridItem" height={400} />
    </Grid>
    <Grid item md={4} xs={12}>
      <DevQuote />
    </Grid>

    <Grid item md={6} xs={12}>
      <OpaMetadataAnalysisCard />
    </Grid>

    <Grid item md={4} xs={12}>
      <EntityLinksCard />
    </Grid>
    <Grid item md={8} xs={12}>
      <EntityHasSubcomponentsCard variant="gridItem" />
    </Grid>
  </Grid>
);
```

## Would you like to contribute? or add more quotes?

Please do! I would love to see more quotes added to this plugin. If you would like to add some quotes, please open a pull request with your changes. If you would like to add a lot of quotes, please open an issue first so we can discuss it. And please keep them programming related, and keep it SFW.

## License

This project is released under the Apache 2.0 License.
