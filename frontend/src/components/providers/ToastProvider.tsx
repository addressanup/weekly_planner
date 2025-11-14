import { Toaster } from 'react-hot-toast';

/**
 * Toast notification provider component
 * Wrap your app with this to enable toast notifications
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          borderRadius: '8px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
