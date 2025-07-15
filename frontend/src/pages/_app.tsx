import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize scroll animations
    const initScrollAnimations = () => {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, observerOptions);

      // Observe all elements with scroll animation classes
      const animatedElements = document.querySelectorAll(
        '.fade-in-on-scroll, .slide-up-on-scroll, .scale-in-on-scroll'
      );

      animatedElements.forEach((element) => {
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
      const timer = setTimeout(initScrollAnimations, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </AuthProvider>
  );
}