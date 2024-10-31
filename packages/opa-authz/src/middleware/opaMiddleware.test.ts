import { PolicyInput } from '../types';
import { opaAuthzMiddleware } from './opaMiddleware';
import { mockServices } from '@backstage/backend-test-utils';
import request from 'supertest';
import express from 'express';
import { OpaAuthzClient } from '../api';

jest.mock('../api');

const mockOpaAuthzClient = {
  evaluatePolicy: jest.fn(),
} as unknown as jest.Mocked<OpaAuthzClient>;

describe('opaAuthzMiddleware', () => {
  let app: express.Express;
  const mockLogger = mockServices.logger.mock();
  const entryPoint = 'testEntryPoint';
  const setInput = (_: express.Request): PolicyInput => ({
    method: 'GET',
    path: '/',
    headers: 'testHeaders',
    user: 'testUser',
  });

  beforeEach(() => {
    app = express();
    jest.clearAllMocks();
  });

  it('should call next() if the policy allows the request', async () => {
    mockOpaAuthzClient.evaluatePolicy.mockResolvedValueOnce({
      decision_id: 'test-decision-id',
      result: { allow: true },
    });

    app.use(
      opaAuthzMiddleware(mockOpaAuthzClient, entryPoint, setInput, mockLogger),
    );
    app.use((_, res) => res.status(200).send('OK'));

    await request(app).get('/').expect(200, 'OK');

    expect(mockLogger.debug).toHaveBeenCalledWith(
      `OPA middleware sending input to OPA: ${JSON.stringify({
        method: 'GET',
        path: '/',
        headers: 'testHeaders',
        user: 'testUser',
      })}`,
    );
    expect(mockLogger.debug).toHaveBeenCalledWith(
      `OPA middleware response: ${JSON.stringify({
        decision_id: 'test-decision-id',
        result: { allow: true },
      })}`,
    );
  });

  it('should return a 403 status code if the policy denies the request', async () => {
    mockOpaAuthzClient.evaluatePolicy.mockResolvedValueOnce({
      decision_id: 'test-decision-id',
      result: { allow: false },
    });

    app.use(
      opaAuthzMiddleware(mockOpaAuthzClient, entryPoint, setInput, mockLogger),
    );
    app.use((_req, res) => res.status(200).send('OK'));

    await request(app).get('/').expect(403, { error: 'Forbidden' });

    expect(mockLogger.debug).toHaveBeenCalledWith(
      `OPA middleware sending input to OPA: ${JSON.stringify({
        method: 'GET',
        path: '/',
        headers: 'testHeaders',
        user: 'testUser',
      })}`,
    );
    expect(mockLogger.debug).toHaveBeenCalledWith(
      `OPA middleware response: ${JSON.stringify({
        decision_id: 'test-decision-id',
        result: { allow: false },
      })}`,
    );
  });

  it('should return a custom error message if provided when access is forbidden', async () => {
    mockOpaAuthzClient.evaluatePolicy.mockResolvedValueOnce({
      decision_id: 'test-decision-id',
      result: { allow: false },
    });

    const customErrorMessage = 'Custom Forbidden Message';
    app.use(
      opaAuthzMiddleware(
        mockOpaAuthzClient,
        entryPoint,
        setInput,
        mockLogger,
        customErrorMessage,
      ),
    );
    app.use((_req, res) => res.status(200).send('OK'));

    await request(app).get('/').expect(403, { error: customErrorMessage });

    expect(mockLogger.debug).toHaveBeenCalledWith(
      `OPA middleware sending input to OPA: ${JSON.stringify({
        method: 'GET',
        path: '/',
        headers: 'testHeaders',
        user: 'testUser',
      })}`,
    );
    expect(mockLogger.debug).toHaveBeenCalledWith(
      `OPA middleware response: ${JSON.stringify({
        decision_id: 'test-decision-id',
        result: { allow: false },
      })}`,
    );
  });

  it('should return a 500 status code if an error occurs during policy evaluation', async () => {
    mockOpaAuthzClient.evaluatePolicy.mockRejectedValueOnce(
      new Error('OPA Error'),
    );

    app.use(
      opaAuthzMiddleware(mockOpaAuthzClient, entryPoint, setInput, mockLogger),
    );
    app.use((_req, res) => res.status(200).send('OK'));

    await request(app).get('/').expect(500, { error: 'Internal Server Error' });

    expect(mockLogger.debug).toHaveBeenCalledWith(
      `OPA middleware sending input to OPA: ${JSON.stringify({
        method: 'GET',
        path: '/',
        headers: 'testHeaders',
        user: 'testUser',
      })}`,
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      `An error occurred while sending the policy input to the OPA server: Error: OPA Error`,
    );
  });
});
