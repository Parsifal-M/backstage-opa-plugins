import { waitFor, renderHook } from '@testing-library/react';
import { useOpaAuthz } from './useOpaAuthz';
import { useApi } from '@backstage/core-plugin-api';
import { OpaAuthzApi } from '../../api';
import { act } from 'react';
import { useOpaAuthzManual } from './useOpaAuthzManual';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('useOpaAuthz', () => {
  const mockEvalPolicy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockEvalPolicy.mockReset();

    (useApi as jest.Mock).mockReturnValue({
      evalPolicy: mockEvalPolicy,
    } as unknown as OpaAuthzApi);
  });

  it('should return the policy result (default options)', async () => {
    mockEvalPolicy.mockResolvedValueOnce({ result: { allow: true } });

    const input = { entity: 'test', testId: 'test1' };
    const entryPoint = 'test';

    const { result } = renderHook(() => useOpaAuthz(input, entryPoint));

    await waitFor(() => {
      expect(mockEvalPolicy).toHaveBeenCalledWith(input, entryPoint, {});

      expect(result.current.data).toEqual({ result: { allow: true } });
      expect(result.current.loading).toBe(false);
    });
  });

  it('should pass includeUserEntity=true to evalPolicy', async () => {
    mockEvalPolicy.mockResolvedValueOnce({ result: { allow: true } });

    const input = { entity: 'test', testId: 'test2' };
    const entryPoint = 'test';

    const { result } = renderHook(() =>
      useOpaAuthz(input, entryPoint, { includeUserEntity: true }),
    );

    await waitFor(() => {
      expect(mockEvalPolicy).toHaveBeenCalledWith(input, entryPoint, {
        includeUserEntity: true,
      });

      expect(result.current.data).toEqual({ result: { allow: true } });
      expect(result.current.loading).toBe(false);
    });
  });
});

describe('useOpaAuthzManual', () => {
  const mockEvalPolicy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockEvalPolicy.mockReset();

    (useApi as jest.Mock).mockReturnValue({
      evalPolicy: mockEvalPolicy,
    } as unknown as OpaAuthzApi);
  });

  it('should not fetch data initially', async () => {
    const { result } = renderHook(() =>
      useOpaAuthzManual({ entity: 'test', testId: 'test2' }, 'test'),
    );

    await waitFor(() => {
      expect(mockEvalPolicy).not.toHaveBeenCalled();
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(true);
    });
  });

  it('should fetch data when evaluatePolicy is called', async () => {
    mockEvalPolicy.mockResolvedValueOnce({ result: { allow: true } });
    const input = { entity: 'test', testId: 'test3' };
    const entryPoint = 'test';

    const { result } = renderHook(() => useOpaAuthzManual(input, entryPoint));

    await act(async () => {
      await result.current.evaluatePolicy();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);

      expect(mockEvalPolicy).toHaveBeenCalledWith(input, entryPoint);

      expect(result.current.data).toEqual({ result: { allow: true } });
    });
  });

  it('should handle errors when fetching', async () => {
    const error = new Error('Test error');
    mockEvalPolicy.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useOpaAuthzManual({ entity: 'test', testId: 'test5' }, 'test'),
    );

    await act(async () => {
      await result.current.evaluatePolicy();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(error);
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });
});
