import React from 'react';
import Head from 'next/head';

interface MetaTagsProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: object;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  keywords,
  ogImage = '/images/og-default.jpg',
  ogType = 'website',
  canonicalUrl,
  noIndex = false,
  structuredData,
}) => {
  const fullTitle = title.includes('Fixia') ? title : `${title} - Fixia`;
  const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] || 'https://fixia.com.ar';
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
  const fullCanonicalUrl = canonicalUrl || baseUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Fixia" />
      <meta property="og:locale" content="es_AR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Fixia" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Spanish" />
      <meta name="geo.region" content="AR-U" />
      <meta name="geo.placename" content="Chubut, Argentina" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
};

export default MetaTags;