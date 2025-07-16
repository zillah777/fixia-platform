import React, { useState, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface LazyImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string;
  className?: string;
  containerClassName?: string;
  loadingClassName?: string;
  errorClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallback = '/images/placeholder.png',
  className = '',
  containerClassName = '',
  loadingClassName = '',
  errorClassName = '',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      {isInView && (
        <>
          {isLoading && (
            <div
              className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center ${loadingClassName}`}
            >
              <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
            </div>
          )}
          
          <Image
            src={hasError ? fallback : src}
            alt={alt}
            className={`transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            } ${hasError ? errorClassName : ''} ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </>
      )}
      
      {!isInView && (
        <div
          className={`bg-gray-200 animate-pulse flex items-center justify-center ${loadingClassName}`}
          style={{
            width: props.width || '100%',
            height: props.height || '200px',
          }}
        >
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;