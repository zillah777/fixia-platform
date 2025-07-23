import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize Marketplace 2.0 scroll animations
    const initMarketplaceAnimations = () => {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.remove('opacity-0');
          }
        });
      }, observerOptions);

      // Observe all elements with marketplace animation classes
      const animatedElements = document.querySelectorAll(
        '.marketplace-animate, .fade-in-on-scroll, .slide-up-on-scroll, .scale-in-on-scroll'
      );

      animatedElements.forEach((element) => {
        element.classList.add('opacity-0');
        observer.observe(element);
      });

      // Cleanup function
      return () => {
        animatedElements.forEach((element) => {
          observer.unobserve(element);
        });
      };
    };

    // Initialize animations after DOM is ready
    if (typeof window !== 'undefined') {
      const timer = setTimeout(initMarketplaceAnimations, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-surface-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-200">
          <Component {...pageProps} />
          
          {/* Marketplace 2.0 Toast System */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'font-display',
              style: {
                background: 'rgb(38 38 38)', // neutral-800
                color: 'rgb(255 255 255)',
                borderRadius: '0.75rem', // rounded-xl
                padding: '1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                duration: 3000,
                style: {
                  background: 'rgb(34 197 94)', // success-500
                  color: 'white',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: 'rgb(34 197 94)',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: 'rgb(239 68 68)', // error-500
                  color: 'white',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: 'rgb(239 68 68)',
                },
              },
              loading: {
                style: {
                  background: 'rgb(59 130 246)', // primary-500
                  color: 'white',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: 'rgb(59 130 246)',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}