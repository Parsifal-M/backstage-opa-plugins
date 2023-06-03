import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { JfrogArtifactoryRepository } from './JfrogArtifactoryRepository';
import { jfrogArtifactoryApiRef } from '../../api/artifactoryApiClient';
import { TestApiProvider } from '@backstage/test-utils';
import { ArtifactResponse, PackageEdge } from '../../types';

// Mock data and function
const mockGetArtifact = jest.fn();
const mockPackageEdge: PackageEdge = {
  node: {
    name: 'Test package',
    description: 'Test description',
    created: '2023-06-02',
    versions: [
      {
        name: '1.0.0',
        size: '1000',
        vulnerabilities: {
          high: 1,
          medium: 0,
          low: 0,
          info: 0,
          unknown: 0,
          skipped: 0,
        },
        stats: { downloadCount: 100 },
        package: { packageType: 'npm' },
      },
    ],
  },
};
const mockArtifactResponse: ArtifactResponse = {
  data: {
    packages: {
      edges: [mockPackageEdge],
    },
  },
};

mockGetArtifact.mockResolvedValue(mockArtifactResponse);

describe('JfrogArtifactoryRepository', () => {
  it('fetches data from the API and renders it in the table', async () => {
    render(
      <TestApiProvider
        apis={[[jfrogArtifactoryApiRef, { getArtifact: mockGetArtifact }]]}
      >
        <JfrogArtifactoryRepository
          widget={false}
          artifact="artifact1"
          title="Artifacts"
        />
      </TestApiProvider>,
    );

    await waitFor(() =>
      expect(mockGetArtifact).toHaveBeenCalledWith('artifact1'),
    );

    // Check the rendering of fetched data
    expect(screen.getByText('Test package')).toBeInTheDocument();
  });
});
