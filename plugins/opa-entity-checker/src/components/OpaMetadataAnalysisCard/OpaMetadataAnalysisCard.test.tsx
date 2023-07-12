import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { OpaMetadataAnalysisCard } from './OpaMetadataAnalysisCard';
import { alertApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import { opaBackendApiRef } from '../../api';

const mockEntityCheck = jest.fn();
const mockAlertPost = jest.fn();

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: {
      apiVersion: "backstage.io/v1alpha1",
      kind: "Component",
      metadata: {
        name: "component-name",
        description: "component-description",
        labels: {
          key: "value"
        },
        annotations: {
          key: "value"
        }
      },
      spec: {
        type: "service",
        system: "example"
      },
      relations: [
        {
          type: "ownedBy",
          target: "user:default/user-name"
        }
      ]
    }
  }),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

test('renders without crashing', async () => {
  render(
    <TestApiProvider apis={[[alertApiRef, { post: mockAlertPost }], [opaBackendApiRef, { entityCheck: mockEntityCheck }]]}>
      <OpaMetadataAnalysisCard />
    </TestApiProvider>
  );

  expect(screen.getByText(/metadata analysis/i)).toBeInTheDocument();
});

test('renders violations if they exist', async () => {
  mockEntityCheck.mockResolvedValue({
    violation: [
      { message: 'Test violation', level: 'error' },
    ],
  });

  render(
    <TestApiProvider apis={[[alertApiRef, { post: mockAlertPost }], [opaBackendApiRef, { entityCheck: mockEntityCheck }]]}>
      <OpaMetadataAnalysisCard />
    </TestApiProvider>
  );

  await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());

  expect(screen.getByText(/test violation/i)).toBeInTheDocument();
});

test('handles error from the api call', async () => {
  mockEntityCheck.mockRejectedValue(new Error());

  render(
    <TestApiProvider apis={[[alertApiRef, { post: mockAlertPost }], [opaBackendApiRef, { entityCheck: mockEntityCheck }]]}>
      <OpaMetadataAnalysisCard />
    </TestApiProvider>
  );

  await waitFor(() => expect(mockAlertPost).toHaveBeenCalled());

  expect(mockAlertPost).toHaveBeenCalledWith({
    message: 'Oops, something went wrong, could not load data from OPA!',
    severity: 'error',
    display: 'transient',
  });
});
