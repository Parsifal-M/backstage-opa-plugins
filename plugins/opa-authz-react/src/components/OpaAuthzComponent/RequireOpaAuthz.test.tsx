import React from 'react';
import { screen } from '@testing-library/react';
import { RequireOpaAuthz } from './RequireOpaAuthz';
import { useOpaAuthz } from '../../hooks/useOpaAuthz/useOpaAuthz';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { opaAuthzBackendApiRef } from '../../api';

// Mock the useOpaAuthz hook
jest.mock('../../hooks/useOpaAuthz/useOpaAuthz');

const mockOpaBackendApi = {
    evalPolicy: jest.fn().mockResolvedValue({ result: { allow: true } }),
  };

describe('RequireOpaAuthz', () => {
  const mockInput = { user: 'test-user', action: 'read', resource: 'document' };
  const mockEntryPoint = 'example/allow';

  it('renders null when loading', () => {
    (useOpaAuthz as jest.Mock).mockReturnValue({ loading: true, data: null });

    renderInTestApp(
    <TestApiProvider apis={[[opaAuthzBackendApiRef, mockOpaBackendApi]]}>
      <RequireOpaAuthz input={mockInput} entryPoint={mockEntryPoint}>
        <div>Protected Content</div>
      </RequireOpaAuthz>,
    </TestApiProvider>
    );

    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders null when there is an error', () => {
    (useOpaAuthz as jest.Mock).mockReturnValue({ loading: false, data: null, error: new Error('Error') });

    renderInTestApp(
      <RequireOpaAuthz input={mockInput} entryPoint={mockEntryPoint}>
        <div>Protected Content</div>
      </RequireOpaAuthz>,
    );

    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders null when access is not allowed', () => {
    (useOpaAuthz as jest.Mock).mockReturnValue({ loading: false, data: { result: { allow: false } } });

    renderInTestApp(
      <RequireOpaAuthz input={mockInput} entryPoint={mockEntryPoint}>
        <div>Protected Content</div>
      </RequireOpaAuthz>,
    );

    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders children when access is allowed', () => {
    (useOpaAuthz as jest.Mock).mockReturnValue({ loading: false, data: { result: { allow: true } } });

    renderInTestApp(
      <RequireOpaAuthz input={mockInput} entryPoint={mockEntryPoint}>
        <div>Protected Content</div>
      </RequireOpaAuthz>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});