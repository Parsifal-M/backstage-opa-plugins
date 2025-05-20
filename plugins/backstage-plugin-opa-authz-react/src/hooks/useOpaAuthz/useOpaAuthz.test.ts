import { waitFor, renderHook } from '@testing-library/react';
import { useOpaAuthz, useOpaAuthzManual } from './useOpaAuthz';
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

    const { result } = renderHook(() =>
      useOpaAuthz({ entity: 'test' }, 'test'),
    );

    await waitFor(() => result.current.data !== null);

    expect(result.current.data).toEqual({ result: { allow: true } });
  });
});

describe('useOpaAuthzManual', () => {
  const mockEvalPolicy = jest.fn();

  beforeEach(() => {
    mockEvalPolicy.mockClear();
    (useApi as jest.Mock).mockReturnValue({
      evalPolicy: mockEvalPolicy,
    } as unknown as OpaAuthzApi);
  });

  it('should not fetch data initially', () => {
    mockEvalPolicy.mockResolvedValue({ result: { allow: true } });

    const { result } = renderHook(() =>
      useOpaAuthzManual({ entity: 'test' }, 'test'),
    );

    expect(mockEvalPolicy).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should fetch data when triggerFetch is called', async () => {
    mockEvalPolicy.mockResolvedValue({ result: { allow: true } });

    const { result } = renderHook(() =>
      useOpaAuthzManual({ entity: 'test' }, 'test'),
    );

    expect(mockEvalPolicy).not.toHaveBeenCalled();

    await result.current.triggerFetch();

    await waitFor(() => result.current.data !== null);

    expect(mockEvalPolicy).toHaveBeenCalledWith({ entity: 'test' }, 'test');
    expect(result.current.data).toEqual({ result: { allow: true } });
  });

  it('should handle errors when fetching', async () => {
    const error = new Error('Test error');
    mockEvalPolicy.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useOpaAuthzManual({ entity: 'test' }, 'test'),
    );

    await result.current.triggerFetch();

    await waitFor(() => result.current.error !== undefined);

    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
