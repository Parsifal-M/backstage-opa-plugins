import { screen } from '@testing-library/react';
import { OpaPolicyPage } from './OpaPolicyComponent';
import { opaPolicyBackendApiRef } from '../../api/types';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import React, { act } from 'react';
import { alertApiRef } from '@backstage/core-plugin-api';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: () => ({
    entity: {
      metadata: {
        name: 'TestEntity',
        annotations: {
          'open-policy-agent/policy': 'test-policy',
        },
      },
    },
  }),
}));

const mockAlertApi = {
  post: jest.fn(),
};

const mockOpaBackendApi = {
  getPolicyFromRepo: jest
    .fn()
    .mockResolvedValue({ opaPolicyContent: 'test-policy-content' }),
};

describe('OpaPolicyPage', () => {
  it('renders without crashing', async () => {
    mockOpaBackendApi.getPolicyFromRepo.mockResolvedValueOnce({
      opaPolicyContent: 'test-policy-content',
    });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [opaPolicyBackendApiRef, mockOpaBackendApi],
            [alertApiRef, mockAlertApi],
          ]}
        >
          <OpaPolicyPage />
        </TestApiProvider>,
      );
    });

    expect(await screen.findByText('test-policy-content')).toBeInTheDocument();
  });
});
