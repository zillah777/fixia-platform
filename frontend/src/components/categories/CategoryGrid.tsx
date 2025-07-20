import React, { useState, useEffect } from 'react';
import { ServiceCategory, GroupedCategories } from '../../types/categories';
import categoriesService from '../../services/categories';

interface CategoryGridProps {
  onCategorySelect?: (category: ServiceCategory) => void;
  selectedCategories?: number[];
  mode?: 'selection' | 'display';
  groupName?: string;
  showGroupHeaders?: boolean;
  maxColumns?: number;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  onCategorySelect,
  selectedCategories = [],
  mode = 'display',
  groupName,
  showGroupHeaders = true,
  maxColumns = 4
}) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategories>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [groupName]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      if (groupName) {
        // Fetch categories for specific group
        const data = await categoriesService.getCategoriesByParent(groupName);
        setCategories(data);
      } else {
        // Fetch all categories grouped
        const data = await categoriesService.getGroupedCategories();
        setGroupedCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: ServiceCategory) => {
    if (mode === 'selection' && onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const isCategorySelected = (categoryId: number) => {
    return selectedCategories.includes(categoryId);
  };

  const renderCategoryCard = (category: ServiceCategory) => {
    const isSelected = isCategorySelected(category.id);
    
    return (
      <div
        key={category.id}
        className={`
          p-4 rounded-lg border transition-all duration-200 cursor-pointer
          ${mode === 'selection' ? 'hover:shadow-md' : 'hover:shadow-sm'}
          ${isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 bg-white hover:border-gray-300'
          }
        `}
        onClick={() => handleCategoryClick(category)}
      >
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">
            {category.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm leading-tight ${
              isSelected ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {category.name}
            </h3>
            {category.description && (
              <p className={`text-xs mt-1 ${
                isSelected ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {category.description}
              </p>
            )}
          </div>
          {mode === 'selection' && isSelected && (
            <div className="text-blue-500 text-sm">
              ✓
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCategoryGroup = (groupName: string, categories: ServiceCategory[]) => (
    <div key={groupName} className="mb-8">
      {showGroupHeaders && (
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {groupName}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({categories.length} servicios)
          </span>
        </h2>
      )}
      <div className={`grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-${maxColumns}`}>
        {categories.map(renderCategoryCard)}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando categorías...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌</div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchCategories}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (groupName) {
    // Render single group
    return (
      <div className={`grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-${maxColumns}`}>
        {categories.map(renderCategoryCard)}
      </div>
    );
  }

  // Render all groups
  return (
    <div className="space-y-8">
      {Object.entries(groupedCategories).map(([groupName, categories]) =>
        renderCategoryGroup(groupName, categories)
      )}
    </div>
  );
};

export default CategoryGrid;