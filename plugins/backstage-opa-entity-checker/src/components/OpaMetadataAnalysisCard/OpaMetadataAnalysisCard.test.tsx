import React, { act } from 'react';
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

it('renders the compact variant when selected', async () => {
  mockEntityCheck.mockResolvedValue({
    result: [
      { message: 'Test violation', level: 'error' },
      { message: 'Test warning violation', level: 'warning' },
    ],
  });

  await act(async () => {
    render(
      <TestApiProvider
        apis={[
          [alertApiRef, { post: mockAlertPost }],
          [opaBackendApiRef, { entityCheck: mockEntityCheck }],
        ]}
      >
        <OpaMetadataAnalysisCard variant="compact" />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockEntityCheck).toHaveBeenCalled();
      expect(screen.getByText(/OPA Entity Checker/i)).toBeInTheDocument();
    });

    // The fab icon are specific of the compact version, if they are there it proves we have the compact
    expect(screen.getByText(/1 WARNINGS/i)).toBeInTheDocument();
    expect(screen.getByText(/1 ERRORS/i)).toBeInTheDocument();
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
