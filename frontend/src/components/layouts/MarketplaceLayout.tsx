import React from 'react';
import Head from 'next/head';

interface MarketplaceLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  maxWidth?: string;
}

const MarketplaceLayout: React.FC<MarketplaceLayoutProps> = ({
  children,
  title = 'Fixia - Plataforma de Servicios Profesionales',
  description = 'Conecta con profesionales verificados en Chubut, Argentina',
  showHeader = true,
  showFooter = true,
  maxWidth = 'full'
}) => {
  return (
    <>
      {title && (
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
        </Head>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
        </div>
        
        <main className="relative z-10">
          {children}
        </main>
      </div>
    </>
  );
};

export default MarketplaceLayout;