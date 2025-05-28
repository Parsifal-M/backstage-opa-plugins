import { waitFor, renderHook } from '@testing-library/react';
import { useOpaAuthz, useOpaAuthzManual } from './useOpaAuthz';
import { useApi } from '@backstage/core-plugin-api';
import { OpaAuthzApi } from '../../api';
import { act } from 'react';

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

 

  it('should return the policy result', async () => {
    mockEvalPolicy.mockResolvedValueOnce({ result: { allow: true } });

    const { result } = renderHook(() =>
      useOpaAuthz({ entity: 'test', testId: 'test1' }, 'test'),
    );
    
    await waitFor(() => {
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
    mockEvalPolicy.mockResolvedValueOnce({ result: { allow: true } });

    const { result } = renderHook(() =>
      useOpaAuthzManual({ entity: 'test', testId: 'test2' }, 'test'),
    );
    await waitFor(() => {
      expect(mockEvalPolicy).not.toHaveBeenCalled();
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(true);
    });
  });

  it('should fetch data when triggerFetch is called', async () => {
    mockEvalPolicy.mockResolvedValueOnce({ result: { allow: true } });

    const { result } = renderHook(() =>
      useOpaAuthzManual({ entity: 'test', testId: 'test3' }, 'test'),
    );

    expect(mockEvalPolicy).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.triggerFetch();
    });

    

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(mockEvalPolicy).toHaveBeenCalledWith({ entity: 'test', testId: 'test3' }, 'test');
      expect(result.current.data).toEqual({ result: { allow: true } });
    });
  });

  it('should handle errors when fetching', async () => {
    const error = new Error('Test error');
    mockEvalPolicy.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useOpaAuthzManual({ entity: 'test', testId: 'test4' }, 'test'),
    );
    
    await act(async () => {
      await result.current.triggerFetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(error);
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });
});
