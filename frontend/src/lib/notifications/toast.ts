import toast from 'react-hot-toast';

/**
 * Custom toast notification utilities with consistent styling
 */

export const showToast = {
  /**
   * Show a success toast notification
   */
  success: (message: string, duration = 3000) => {
    return toast.success(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    });
  },

  /**
   * Show an error toast notification
   */
  error: (message: string, duration = 4000) => {
    return toast.error(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    });
  },

  /**
   * Show an info toast notification
   */
  info: (message: string, duration = 3000) => {
    return toast(message, {
      duration,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: (message: string, duration = 3500) => {
    return toast(message, {
      duration,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },

  /**
   * Show a loading toast notification
   */
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6b7280',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },

  /**
   * Show a promise toast that updates based on promise state
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: 'top-right',
        style: {
          fontWeight: '500',
        },
        success: {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
      }
    );
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Custom toast with full control
   */
  custom: (message: string, options?: Parameters<typeof toast>[1]) => {
    return toast(message, options);
  },
};
