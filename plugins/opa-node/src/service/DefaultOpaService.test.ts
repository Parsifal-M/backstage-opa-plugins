import { DefaultOpaService } from './DefaultOpaService';
import { OpaClient } from '../api/opaClient';

const mockOpaClient: jest.Mocked<OpaClient> = {
  evaluatePolicy: jest.fn(),
};

describe('DefaultOpaService', () => {
  let service: DefaultOpaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DefaultOpaService(mockOpaClient);
  });

  it('should delegate evaluatePolicy to the OpaClient', async () => {
    const mockResult = { result: { allow: true } };
    mockOpaClient.evaluatePolicy.mockResolvedValueOnce(mockResult);

    const result = await service.evaluatePolicy(
      { user: 'test' },
      'test/policy',
    );

    expect(mockOpaClient.evaluatePolicy).toHaveBeenCalledWith(
      { user: 'test' },
      'test/policy',
    );
    expect(result).toEqual(mockResult);
  });

  it('should propagate errors from OpaClient', async () => {
    mockOpaClient.evaluatePolicy.mockRejectedValueOnce(new Error('OPA down'));

    await expect(
      service.evaluatePolicy({ user: 'test' }, 'test/policy'),
    ).rejects.toThrow('OPA down');
  });
});
