import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  badge?: number;
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  userType: 'explorer' | 'specialist';
  ctaSection?: React.ReactNode;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpen,
  onClose,
  items,
  userType,
  ctaSection
}) => {
  const router = useRouter();

  const isCurrentPath = (href: string) => {
    return router.pathname === href;
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">Fixia</span>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="mt-4 px-2">
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                isCurrentPath(item.href)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
                {item.badge && (
                  <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
        
        {ctaSection && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            {ctaSection}
          </div>
        )}
      </nav>
    </div>
  );
};

export default DashboardSidebar;