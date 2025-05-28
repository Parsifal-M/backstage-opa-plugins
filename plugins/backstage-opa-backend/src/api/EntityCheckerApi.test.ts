import {
  countResultByLevel,
  determineOverallStatus,
  EntityCheckerApiImpl,
  EntityCheckerConfig,
  OPAResult,
} from './EntityCheckerApi';
import { mockServices } from '@backstage/backend-test-utils';

const mockLogger = mockServices.logger.mock();

describe('EntityCheckerApiImpl', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should log error when opaBaseUrl is missing', () => {
    const config: EntityCheckerConfig = {
      logger: mockLogger,
      opaBaseUrl: undefined,
      entityCheckerEntrypoint: 'test-package',
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _api = new EntityCheckerApiImpl(config);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'OPA URL not set or missing!',
    );
  });

  it('should log error when opaClient.policies.entityChecker.entryPoint (entityCheckerEntrypoint) is missing', () => {
    const config: EntityCheckerConfig = {
      logger: mockLogger,
      opaBaseUrl: 'http://localhost:8181',
      entityCheckerEntrypoint: undefined,
    };

    const _api = new EntityCheckerApiImpl(config);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'OPA package not set or missing!',
    );
  });

  it('should log both errors when both config values are missing', () => {
    const config: EntityCheckerConfig = {
      logger: mockLogger,
      opaBaseUrl: undefined,
      entityCheckerEntrypoint: undefined,
    };

    const _api = new EntityCheckerApiImpl(config);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'OPA URL not set or missing!',
    );
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'OPA package not set or missing!',
    );
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
  });
});

describe('countResultByLevel', () => {
  it('should count the occurrences of each level', () => {
    const results: OPAResult[] = [
      { level: 'error', message: 'Error message 1' },
      { level: 'warning', message: 'Warning message 1' },
      { level: 'error', message: 'Error message 2' },
      { level: 'info', message: 'Info message 1' },
      { level: 'warning', message: 'Warning message 2' },
      { level: 'error', message: 'Error message 3' },
    ];
    const expectedCounts = new Map<string, number>([
      ['error', 3],
      ['warning', 2],
      ['info', 1],
    ]);
    const actualCounts = countResultByLevel(results);
    expect(actualCounts).toEqual(expectedCounts);
  });
  it('should return an empty map for an empty array', () => {
    const results: OPAResult[] = [];
    const expectedCounts = new Map<string, number>();
    const actualCounts = countResultByLevel(results);
    expect(actualCounts).toEqual(expectedCounts);
  });
});
describe('determineOverallStatus', () => {
  it('should return error if count of errors > 0', () => {
    const levelCounts = new Map([
      ['error', 2],
      ['warning', 1],
      ['info', 3],
    ]);
    const priorityOrder = ['error', 'warning', 'info'];
    expect(determineOverallStatus(levelCounts, priorityOrder)).toBe('error');
  });
  it('should return "warning" when there are no errors', () => {
    const levelCounts = new Map([
      ['warning', 1],
      ['info', 3],
    ]);
    const priorityOrder = ['error', 'warning', 'info'];
    expect(determineOverallStatus(levelCounts, priorityOrder)).toBe('warning');
  });
  it('should return "info" when there are no errors nor warnings', () => {
    const levelCounts = new Map([['info', 3]]);
    const priorityOrder = ['error', 'warning', 'info'];
    expect(determineOverallStatus(levelCounts, priorityOrder)).toBe('info');
  });

  it('should return "pass" when all counts are 0', () => {
    const levelCounts = new Map([
      ['error', 0],
      ['warning', 0],
      ['info', 0],
    ]);
    const priorityOrder = ['error', 'warning', 'info'];
    expect(determineOverallStatus(levelCounts, priorityOrder)).toBe('pass');
  });
  it('should return "pass" when the map is empty', () => {
    const levelCounts = new Map();
    const priorityOrder = ['error', 'warning', 'info'];
    expect(determineOverallStatus(levelCounts, priorityOrder)).toBe('pass');
  });
  it('should use the provided priority order, let swap things around', () => {
    const levelCounts = new Map([
      ['error', 1],
      ['warning', 1],
      ['info', 1],
    ]);
    const priorityOrder = ['warning', 'error', 'info']; // Different order
    expect(determineOverallStatus(levelCounts, priorityOrder)).toBe('warning');
  });
});