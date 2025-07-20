import React, { useState, useEffect } from 'react';
import { ServiceCategory } from '../../types/categories';
import categoriesService from '../../services/categories';

interface CategorySelectorProps {
  value?: number;
  onChange: (categoryId: number, category: ServiceCategory) => void;
  placeholder?: string;
  error?: string;
  groupFilter?: string;
  className?: string;
  required?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  placeholder = 'Selecciona una categoría',
  error,
  groupFilter,
  className = '',
  required = false
}) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [groupFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      let data: ServiceCategory[];
      
      if (groupFilter) {
        data = await categoriesService.getCategoriesByParent(groupFilter);
      } else {
        data = await categoriesService.getAllCategories();
      }
      
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCategory = categories.find(cat => cat.id === value);

  const handleSelect = (category: ServiceCategory) => {
    onChange(category.id, category);
    setIsOpen(false);
    setSearchTerm('');
  };

  const groupedCategories = filteredCategories.reduce((acc, category) => {
    const group = category.parent_category || 'Otros';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(category);
    return acc;
  }, {} as Record<string, ServiceCategory[]>);

  return (
    <div className={`relative ${className}`}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 text-left bg-white border rounded-lg flex items-center justify-between
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'hover:border-gray-400'}
          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
        `}
      >
        <div className="flex items-center">
          {selectedCategory && (
            <span className="text-xl mr-3">{selectedCategory.icon}</span>
          )}
          <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
            {selectedCategory ? selectedCategory.name : placeholder}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Categories List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Cargando categorías...
              </div>
            ) : Object.keys(groupedCategories).length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No se encontraron categorías
              </div>
            ) : (
              Object.entries(groupedCategories).map(([groupName, groupCategories]) => (
                <div key={groupName}>
                  {!groupFilter && (
                    <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-200">
                      {groupName}
                    </div>
                  )}
                  {groupCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleSelect(category)}
                      className={`
                        w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center
                        ${value === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                      `}
                    >
                      <span className="text-lg mr-3">{category.icon}</span>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-gray-500">{category.description}</div>
                        )}
                      </div>
                      {value === category.id && (
                        <span className="ml-auto text-blue-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CategorySelector;