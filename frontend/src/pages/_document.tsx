import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* FIXIA 2025 - Corporate Professional Favicon System */}
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Corporate Brand Metadata */}
        <meta name="theme-color" content="#1e40af" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Corporate PWA Support */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Corporate Preload Critical Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Corporate SEO Enhancement */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Fixia - Servicios Profesionales Chubut" />
        <meta name="copyright" content="© 2025 Fixia. Todos los derechos reservados." />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}