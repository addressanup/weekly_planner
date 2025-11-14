import { describe, it, expect, vi, beforeEach } from 'vitest';
import toast from 'react-hot-toast';
import { showToast } from './toast';

vi.mock('react-hot-toast');

describe('Toast Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('showToast.success', () => {
    it('calls toast.success with correct message', () => {
      showToast.success('Operation successful');

      expect(toast.success).toHaveBeenCalledWith(
        'Operation successful',
        expect.objectContaining({
          duration: 3000,
          position: 'top-right',
        })
      );
    });

    it('uses custom duration when provided', () => {
      showToast.success('Success', 5000);

      expect(toast.success).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({
          duration: 5000,
        })
      );
    });
  });

  describe('showToast.error', () => {
    it('calls toast.error with correct message', () => {
      showToast.error('Operation failed');

      expect(toast.error).toHaveBeenCalledWith(
        'Operation failed',
        expect.objectContaining({
          duration: 4000,
          position: 'top-right',
        })
      );
    });

    it('uses custom duration when provided', () => {
      showToast.error('Error', 6000);

      expect(toast.error).toHaveBeenCalledWith(
        'Error',
        expect.objectContaining({
          duration: 6000,
        })
      );
    });
  });

  describe('showToast.info', () => {
    it('calls toast with info configuration', () => {
      showToast.info('Information message');

      expect(toast).toHaveBeenCalledWith(
        'Information message',
        expect.objectContaining({
          duration: 3000,
          position: 'top-right',
          icon: 'ℹ️',
        })
      );
    });
  });

  describe('showToast.warning', () => {
    it('calls toast with warning configuration', () => {
      showToast.warning('Warning message');

      expect(toast).toHaveBeenCalledWith(
        'Warning message',
        expect.objectContaining({
          duration: 3500,
          position: 'top-right',
          icon: '⚠️',
        })
      );
    });
  });

  describe('showToast.loading', () => {
    it('calls toast.loading with correct message', () => {
      showToast.loading('Loading...');

      expect(toast.loading).toHaveBeenCalledWith(
        'Loading...',
        expect.objectContaining({
          position: 'top-right',
        })
      );
    });
  });

  describe('showToast.promise', () => {
    it('calls toast.promise with correct configuration', async () => {
      const promise = Promise.resolve('data');
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Failed!',
      };

      showToast.promise(promise, messages);

      expect(toast.promise).toHaveBeenCalledWith(
        promise,
        messages,
        expect.objectContaining({
          position: 'top-right',
        })
      );
    });
  });

  describe('showToast.dismiss', () => {
    it('calls toast.dismiss without ID', () => {
      showToast.dismiss();

      expect(toast.dismiss).toHaveBeenCalledWith(undefined);
    });

    it('calls toast.dismiss with specific toast ID', () => {
      showToast.dismiss('toast-123');

      expect(toast.dismiss).toHaveBeenCalledWith('toast-123');
    });
  });

  describe('showToast.custom', () => {
    it('calls toast with custom message and options', () => {
      const options = { duration: 2000 };
      showToast.custom('Custom message', options);

      expect(toast).toHaveBeenCalledWith('Custom message', options);
    });
  });
});
