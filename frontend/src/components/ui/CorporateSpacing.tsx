import React from 'react';

interface CorporateSpacingProps {
  children: React.ReactNode;
  className?: string;
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  marginBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  paddingX?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  paddingY?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  responsive?: boolean;
}

const CorporateSpacing: React.FC<CorporateSpacingProps> = ({
  children,
  className = '',
  margin,
  padding,
  marginTop,
  marginBottom,
  paddingX,
  paddingY,
  responsive = true
}) => {
  const getSpacingClass = (type: string, size?: string) => {
    if (!size) return '';
    
    const prefix = type === 'margin' ? 'm' : 
                   type === 'marginTop' ? 'mt' :
                   type === 'marginBottom' ? 'mb' :
                   type === 'padding' ? 'p' :
                   type === 'paddingX' ? 'px' :
                   type === 'paddingY' ? 'py' : '';
    
    if (!responsive) {
      switch (size) {
        case 'none': return `${prefix}-0`;
        case 'xs': return `${prefix}-2`;
        case 'sm': return `${prefix}-4`;
        case 'md': return `${prefix}-6`;
        case 'lg': return `${prefix}-8`;
        case 'xl': return `${prefix}-12`;
        case '2xl': return `${prefix}-16`;
        default: return '';
      }
    }
    
    // Responsive spacing
    switch (size) {
      case 'none': return `${prefix}-0`;
      case 'xs': return `${prefix}-2 xs:${prefix}-3`;
      case 'sm': return `${prefix}-3 xs:${prefix}-4 sm:${prefix}-4`;
      case 'md': return `${prefix}-4 xs:${prefix}-5 sm:${prefix}-6 md:${prefix}-6`;
      case 'lg': return `${prefix}-6 xs:${prefix}-7 sm:${prefix}-8 md:${prefix}-8`;
      case 'xl': return `${prefix}-8 xs:${prefix}-10 sm:${prefix}-12 md:${prefix}-12`;
      case '2xl': return `${prefix}-12 xs:${prefix}-14 sm:${prefix}-16 md:${prefix}-16`;
      default: return '';
    }
  };

  const spacingClasses = [
    getSpacingClass('margin', margin),
    getSpacingClass('padding', padding),
    getSpacingClass('marginTop', marginTop),
    getSpacingClass('marginBottom', marginBottom),
    getSpacingClass('paddingX', paddingX),
    getSpacingClass('paddingY', paddingY),
  ].filter(Boolean).join(' ');

  return (
    <div className={`${spacingClasses} ${className}`}>
      {children}
    </div>
  );
};

export default CorporateSpacing;