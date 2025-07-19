import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';

interface CorporateHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  rightActions?: React.ReactNode;
  showLogo?: boolean;
  variant?: 'default' | 'minimal' | 'featured';
}

const CorporateHeader: React.FC<CorporateHeaderProps> = ({
  title,
  subtitle,
  backUrl,
  rightActions,
  showLogo = true,
  variant = 'default'
}) => {
  const getHeaderClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-white/95 backdrop-blur-xl border-b border-secondary-200/50';
      case 'featured':
        return 'bg-gradient-to-r from-primary-50 via-white to-trust-50 backdrop-blur-xl border-b border-secondary-200/30';
      default:
        return 'bg-white/98 backdrop-blur-xl border-b border-secondary-200/40 shadow-sm';
    }
  };

  const getTitleClasses = () => {
    switch (variant) {
      case 'featured':
        return 'text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-trust-600 bg-clip-text text-transparent';
      default:
        return 'text-2xl lg:text-3xl font-bold text-secondary-900';
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${getHeaderClasses()}`}>
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between py-3 sm:py-4 lg:hidden">
          <div className="flex items-center space-x-2">
            {backUrl && (
              <Link href={backUrl}>
                <button className="group p-2 hover:bg-secondary-100 rounded-xl transition-all duration-200">
                  <ArrowLeftIcon className="h-4 w-4 text-secondary-600 group-hover:text-primary-600 transition-colors duration-200" />
                </button>
              </Link>
            )}
            {showLogo && (
              <Logo size="sm" variant="primary" showText={false} />
            )}
          </div>
          
          <div className="flex-1 text-center px-2">
            <h1 className="text-lg xs:text-xl font-bold text-secondary-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-secondary-600 font-medium truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {rightActions}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between py-6">
          {/* Left Section - Back Button & Logo */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            {backUrl && (
              <Link href={backUrl}>
                <button className="group p-3 hover:bg-secondary-100 rounded-xl transition-all duration-200 border border-transparent hover:border-secondary-200">
                  <ArrowLeftIcon className="h-5 w-5 text-secondary-600 group-hover:text-primary-600 transition-colors duration-200" />
                </button>
              </Link>
            )}
            
            {showLogo && (
              <Logo size="lg" variant="primary" showText={true} />
            )}
          </div>

          {/* Center Section - Title */}
          <div className="flex-1 text-center max-w-3xl mx-8 xl:mx-12">
            <h1 className={getTitleClasses()}>
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base xl:text-lg text-secondary-600 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-4">
            {rightActions}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CorporateHeader;