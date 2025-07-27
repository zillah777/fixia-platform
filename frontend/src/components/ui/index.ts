import React from 'react';

// Re-export all UI components for easy importing
export { Button } from './button';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
export { Input } from './input';
export { Badge } from './badge';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Checkbox } from './checkbox';
export { Label } from './label';
export { Progress } from './progress';
export { Separator } from './separator';
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './dropdown-menu';
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './table';

// Legacy component aliases for backward compatibility
export { Button as CorporateButton } from './button';
export { Card as CorporateCard } from './card';
export { Input as CorporateInput } from './input';

// Corporate layout component (basic implementation)
export const CorporateLayout: React.FC<{ children: React.ReactNode; variant?: string; maxWidth?: string }> = ({ 
  children, 
  variant = 'default', 
  maxWidth = 'full' 
}) => (
  <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
    </div>
    <main className="relative z-10">
      {children}
    </main>
  </div>
);

export const CorporateHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <header className="glass border-b border-white/10 p-6">
    {children}
  </header>
);

export const CorporateFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <footer className="glass border-t border-white/10 p-6 mt-auto">
    {children}
  </footer>
);

export const CorporateNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <nav className="glass border-b border-white/10 p-4">
    {children}
  </nav>
);