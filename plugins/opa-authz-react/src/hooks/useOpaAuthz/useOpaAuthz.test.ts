import { waitFor, renderHook } from '@testing-library/react';
import { useOpaAuthz } from './useOpaAuthz';
import { useApi } from '@backstage/core-plugin-api';
import { OpaAuthzApi } from '../../api';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('useOpaAuthz', () => {
  const mockEvalPolicy = jest.fn();

  beforeEach(() => {
    (useApi as jest.Mock).mockReturnValue({
      evalPolicy: mockEvalPolicy,
    } as unknown as OpaAuthzApi);
  });

  it('should return the policy result', async () => {
    mockEvalPolicy.mockResolvedValue({ result: { allow: true } });

    const { result } = renderHook(() => useOpaAuthz({ entity: 'test' }, 'test'));

    await waitFor(() => result.current.data !== null);

    expect(result.current.data).toEqual({ result: { allow: true } });
  });
});