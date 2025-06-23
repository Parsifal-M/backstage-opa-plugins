import { screen } from '@testing-library/react';
import { OpaPolicyPage } from './OpaPolicyComponent';
import { opaApiRef } from '../../api';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { act } from 'react';
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
    .mockResolvedValue({ opaPolicyContent: 'policy' }),
};

describe('OpaPolicyPage', () => {
  it('renders without crashing', async () => {
    mockOpaBackendApi.getPolicyFromRepo.mockResolvedValueOnce({
      opaPolicyContent: 'policy',
    });
    await act(async () => {
      renderInTestApp(
        <TestApiProvider
          apis={[
            [opaApiRef, mockOpaBackendApi],
            [alertApiRef, mockAlertApi],
          ]}
        >
          <OpaPolicyPage />
        </TestApiProvider>,
      );
    });

    expect(await screen.findByText('policy')).toBeInTheDocument();
  });
});
