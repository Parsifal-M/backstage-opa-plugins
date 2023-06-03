import { Entity } from '@backstage/catalog-model';

export const JFROG_ARTIFACTORY_ANNOTATION_ARTIFACT_NAME =
  'jfrog-artifactory/artifact-name';

export const useJfrogArtifactoryAppData = ({ entity }: { entity: Entity }) => {
  const artifactName =
    entity?.metadata.annotations?.[
      JFROG_ARTIFACTORY_ANNOTATION_ARTIFACT_NAME
    ] ?? '';

  if (!artifactName) {
    throw new Error("'Jfrog Artifactory' annotations are missing");
  }
  return { artifactName };
};
