import React from 'react';
import { render, waitFor, screen, act } from '@testing-library/react';
import { OpaMetadataAnalysisCard } from './OpaMetadataAnalysisCard';
import { alertApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import { opaBackendApiRef } from '../../api';

const mockEntityCheck = jest.fn();
const mockAlertPost = jest.fn();

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'component-name',
        description: 'component-description',
        labels: {
          key: 'value',
        },
        annotations: {
          key: 'value',
        },
      },
      spec: {
        type: 'service',
        system: 'example',
      },
      relations: [
        {
          type: 'ownedBy',
          target: 'user:default/user-name',
        },
      ],
    },
  }),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

it('renders without crashing', async () => {
  await act(async () => {
    render(
      <TestApiProvider
        apis={[
          [alertApiRef, { post: mockAlertPost }],
          [opaBackendApiRef, { entityCheck: mockEntityCheck }],
        ]}
      >
        <OpaMetadataAnalysisCard />
      </TestApiProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText(/OPA Entity Checker/i)).toBeInTheDocument(),
    );
  });
});

it('renders violations if they exist', async () => {
  mockEntityCheck.mockResolvedValue({
    result: [{ message: 'Test violation', level: 'error' }],
  });

  await act(async () => {
    render(
      <TestApiProvider
        apis={[
          [alertApiRef, { post: mockAlertPost }],
          [opaBackendApiRef, { entityCheck: mockEntityCheck }],
        ]}
      >
        <OpaMetadataAnalysisCard />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockEntityCheck).toHaveBeenCalled();
      expect(screen.getByText(/test violation/i)).toBeInTheDocument();
    });
  });
});

it('handles error from the api call', async () => {
  mockEntityCheck.mockRejectedValue(new Error());
  const someError = new Error();

  await act(async () => {
    render(
      <TestApiProvider
        apis={[
          [alertApiRef, { post: mockAlertPost }],
          [opaBackendApiRef, { entityCheck: mockEntityCheck }],
        ]}
      >
        <OpaMetadataAnalysisCard />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockAlertPost).toHaveBeenCalled();
    });

    expect(mockAlertPost).toHaveBeenCalledWith({
      message: `Could not fetch data from OPA: ${someError}`,
      severity: 'error',
      display: 'transient',
    });
  });
});
