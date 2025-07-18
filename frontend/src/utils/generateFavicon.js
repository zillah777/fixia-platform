// FIXIA 2025 - Professional Favicon Generator
// Creates corporate-grade favicon with modern design

const generateFaviconSVG = () => {
  return `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="corporateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e40af" />
      <stop offset="50%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#0ea5e9" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <filter id="corporateShadow">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#1e40af" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- Professional Corporate Container -->
  <rect
    x="2"
    y="2"
    width="28"
    height="28"
    rx="7"
    fill="url(#corporateGradient)"
    filter="url(#corporateShadow)"
  />
  
  <!-- Inner Professional Border -->
  <rect
    x="3"
    y="3"
    width="26"
    height="26"
    rx="6"
    fill="none"
    stroke="rgba(255,255,255,0.2)"
    stroke-width="0.5"
  />
  
  <!-- Modern F - Geometric & Professional -->
  <g fill="white" opacity="0.95">
    <rect x="9" y="9" width="2" height="14" rx="0.5" />
    <rect x="9" y="9" width="10" height="2" rx="0.5" />
    <rect x="9" y="15" width="7" height="2" rx="0.5" />
  </g>
  
  <!-- Modern X - Clean Professional Symbol -->
  <g fill="white" opacity="0.9">
    <rect x="19" y="13" width="6" height="1.5" rx="0.75" transform="rotate(45 22 13.75)" />
    <rect x="19" y="17" width="6" height="1.5" rx="0.75" transform="rotate(-45 22 17.75)" />
  </g>
  
  <!-- Professional Accent Dot -->
  <circle cx="24" cy="10" r="1" fill="url(#accentGradient)" opacity="0.8" />
</svg>
  `.trim();
};

// Generate different sizes for comprehensive favicon support
const generateFaviconData = () => {
  const svg = generateFaviconSVG();
  
  // Convert SVG to data URL for different formats
  const svgBase64 = btoa(svg);
  const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;
  
  return {
    svg: svg,
    svgDataUrl: svgDataUrl,
    sizes: [16, 32, 48, 64, 128, 256, 512]
  };
};

// Generate favicon manifest for web app
const generateFaviconManifest = () => {
  return {
    "name": "Fixia - Servicios Profesionales",
    "short_name": "Fixia",
    "description": "Plataforma profesional de servicios en Chubut",
    "theme_color": "#1e40af",
    "background_color": "#ffffff",
    "display": "standalone",
    "orientation": "portrait",
    "scope": "/",
    "start_url": "/",
    "icons": [
      {
        "src": "/favicon-16x16.png",
        "sizes": "16x16",
        "type": "image/png"
      },
      {
        "src": "/favicon-32x32.png", 
        "sizes": "32x32",
        "type": "image/png"
      },
      {
        "src": "/apple-touch-icon.png",
        "sizes": "180x180",
        "type": "image/png"
      },
      {
        "src": "/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  };
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateFaviconSVG,
    generateFaviconData,
    generateFaviconManifest
  };
}

console.log('Fixia 2025 Professional Favicon System Generated ✅');
console.log('SVG Code:');
console.log(generateFaviconSVG());