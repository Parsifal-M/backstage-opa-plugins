import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';
import { JfrogArtifactoryRepository } from '../JfrogArtifactoryRepository';
import { useJfrogArtifactoryAppData } from '../useJfrogArtifactoryAppData';

export const JfrogArtifactoryDashboardPage = () => {
  const { entity } = useEntity();
  const { artifactName } = useJfrogArtifactoryAppData({ entity });

  return <JfrogArtifactoryRepository artifact={artifactName} widget={false} />;
};
