import React from 'react';

interface CorporateGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

const CorporateGrid: React.FC<CorporateGridProps> = ({
  children,
  className = '',
  cols = { xs: 1, sm: 2, lg: 3 },
  gap = 'md',
  responsive = true
}) => {
  const getColClasses = () => {
    if (!responsive) return 'grid-cols-1';
    
    const colClasses = [];
    
    if (cols.xs) colClasses.push(`grid-cols-${cols.xs}`);
    if (cols.sm) colClasses.push(`xs:grid-cols-${cols.sm}`);
    if (cols.md) colClasses.push(`sm:grid-cols-${cols.md}`);
    if (cols.lg) colClasses.push(`md:grid-cols-${cols.lg}`);
    if (cols.xl) colClasses.push(`lg:grid-cols-${cols.xl}`);
    if (cols['2xl']) colClasses.push(`xl:grid-cols-${cols['2xl']}`);
    
    return colClasses.join(' ');
  };

  const getGapClasses = () => {
    switch (gap) {
      case 'none': return 'gap-0';
      case 'xs': return 'gap-2 xs:gap-3';
      case 'sm': return 'gap-3 xs:gap-4';
      case 'md': return 'gap-4 xs:gap-5 sm:gap-6';
      case 'lg': return 'gap-6 xs:gap-7 sm:gap-8';
      case 'xl': return 'gap-8 xs:gap-9 sm:gap-10 md:gap-12';
      default: return 'gap-4 xs:gap-5 sm:gap-6';
    }
  };

  return (
    <div className={`grid ${getColClasses()} ${getGapClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default CorporateGrid;