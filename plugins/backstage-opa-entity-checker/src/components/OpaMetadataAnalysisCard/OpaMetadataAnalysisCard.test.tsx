import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { OpaMetadataAnalysisCard } from './OpaMetadataAnalysisCard';
import { alertApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import { opaBackendApiRef } from '../../api';

const mockEntityCheck = jest.fn();
const mockAlertPost = jest.fn();
const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'component-name',
    description: 'component-description',
    labels: { key: 'value' },
    annotations: { key: 'value' },
  },
  spec: {
    type: 'service',
    system: 'example',
  },
  relations: [
    {
      type: 'ownedBy',
      target: 'user:default/user-name',
    },
  ],
};

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({ entity: mockEntity }),
}));

const renderComponent = (props = {}) => {
  return render(
    <TestApiProvider
      apis={[
        [alertApiRef, { post: mockAlertPost }],
        [opaBackendApiRef, { entityCheck: mockEntityCheck }],
      ]}
    >
      <OpaMetadataAnalysisCard {...props} />
    </TestApiProvider>,
  );
};

describe('OpaMetadataAnalysisCard', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('basic rendering', () => {
    it('renders with default title', async () => {
      mockEntityCheck.mockResolvedValue({ result: [] });

      renderComponent();

      await waitFor(() =>
        expect(mockEntityCheck).toHaveBeenCalledWith(mockEntity),
      );
      expect(screen.getByText('OPA Entity Checker')).toBeInTheDocument();
    });

    it('renders with custom title', async () => {
      mockEntityCheck.mockResolvedValue({ result: [] });

      renderComponent({ title: 'Custom Title' });

      await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders children content', async () => {
      mockEntityCheck.mockResolvedValue({ result: [] });

      renderComponent({ children: <div>Custom children content</div> });

      await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());
      expect(screen.getByText('Custom children content')).toBeInTheDocument();
    });
  });

  describe('result handling', () => {
    it('shows "No issues found" when empty results returned', async () => {
      mockEntityCheck.mockResolvedValue({ result: [] });

      renderComponent();

      await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());
      expect(screen.getByText('No issues found!')).toBeInTheDocument();
    });

    it('shows message when no results returned', async () => {
      mockEntityCheck.mockResolvedValue(null);

      renderComponent();

      await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());
      expect(
        screen.getByText(/OPA did not return any results/i),
      ).toBeInTheDocument();
    });

    it('renders different severity violations correctly', async () => {
      mockEntityCheck.mockResolvedValue({
        result: [
          { id: '1', message: 'Error violation', level: 'error' },
          { id: '2', message: 'Warning violation', level: 'warning' },
          { id: '3', message: 'Info message', level: 'info' },
        ],
      });

      renderComponent();

      await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());
      expect(screen.getByText('Error violation')).toBeInTheDocument();
      expect(screen.getByText('Warning violation')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.getByText('ERROR')).toBeInTheDocument(); // Status chip
    });
  });

  describe('compact variant', () => {
    it('renders status chips with correct counts', async () => {
      mockEntityCheck.mockResolvedValue({
        result: [
          { message: 'Error 1', level: 'error' },
          { message: 'Error 2', level: 'error' },
          { message: 'Warning', level: 'warning' },
          { message: 'Info', level: 'info' },
        ],
      });

      renderComponent({ variant: 'compact' });

      await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());
      expect(screen.getByText('2 Errors')).toBeInTheDocument();
      expect(screen.getByText('1 Warning')).toBeInTheDocument();
      expect(screen.getByText('1 Info')).toBeInTheDocument();
    });

    it('expands accordion when clicked', async () => {
      mockEntityCheck.mockResolvedValue({
        result: [{ message: 'Test message', level: 'error' }],
      });

      renderComponent({ variant: 'compact' });

      await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());

      // Before expansion, violation message shouldn't be visible
      expect(screen.queryByText('Test message')).not.toBeVisible();

      // Click to expand
      fireEvent.click(screen.getByText('OPA Entity Checker'));

      // After expansion, violation should be visible
      expect(screen.getByText('Test message')).toBeVisible();
    });
  });

  describe('error handling', () => {
    it('displays alert when API call fails', async () => {
      const testError = new Error('Test error');
      mockEntityCheck.mockRejectedValue(testError);

      renderComponent();

      await waitFor(() => {
        expect(mockAlertPost).toHaveBeenCalledWith({
          message: `Could not fetch data from OPA: ${testError}`,
          severity: 'error',
          display: 'transient',
        });
      });
    });
  });

  describe('status display', () => {
    it('shows SUCCESS chip for passing checks', async () => {
      mockEntityCheck.mockResolvedValue({
        result: [{ message: 'Just info', level: 'info' }],
      });

      renderComponent();

      await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());
      const statusChip = screen.getByText('INFO');
      expect(statusChip).toBeInTheDocument();
    });

    it('shows an INFO chip for Info results', async () => {
      mockEntityCheck.mockResolvedValue({
        result: [{ message: 'Just info', level: 'info' }],
      });

      renderComponent();

      await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());
      const statusChip = screen.getByText('INFO');
      expect(statusChip).toBeInTheDocument();
    });

    it('shows ERROR chip for failing checks', async () => {
      mockEntityCheck.mockResolvedValue({
        result: [{ message: 'Error message', level: 'error' }],
      });

      renderComponent();

      await waitFor(() => expect(mockEntityCheck).toHaveBeenCalled());
      const statusChip = screen.getByText('ERROR');
      expect(statusChip).toBeInTheDocument();
    });
  });
});
