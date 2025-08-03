import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { PromotionProvider } from '@/contexts/PromotionContext';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PromotionProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Component {...pageProps} />
        
        {/* Toast notifications with Fixia styling */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              color: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem',
              padding: '1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
            },
            success: {
              duration: 3000,
              style: {
                background: 'rgba(81, 207, 102, 0.2)',
                color: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid rgba(81, 207, 102, 0.3)',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: 'rgba(255, 107, 107, 0.2)',
                color: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
              },
            },
          }}
        />
        </div>
      </PromotionProvider>
    </AuthProvider>
  );
}