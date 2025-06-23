import React from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const FilterControls = ({
  filters,
  onFiltersChange,
}) => {
  const { t } = useTranslation();

  // Danh sách catalog cố định
  const catalogOptions = [
    { value: "", label: t("allCatalogs") },
    { value: "Languages", label: t("Languages") },
    { value: "Computing", label: t("Computing") },
    { value: "None", label: t("None") },
    { value: "Languages and Computing", label: t("Languages and Computing") },
  ];

  const handleCatalogChange = (catalog) => {
    onFiltersChange({
      ...filters,
      catalog,
    });
  };

  const handleLevelChange = (level) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter(l => l !== level)
      : [...filters.levels, level];
    onFiltersChange({
      ...filters,
      levels: newLevels
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">{t('filters')}</h3>
      </div>
      
      <div className="space-y-6">
        {/* Special Courses (3-state: unset, true, false) */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">{t('specialCourses')}</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="specialOnly"
                checked={filters.specialOnly === undefined}
                onChange={() => onFiltersChange({ ...filters, specialOnly: undefined })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{t('all')}</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="specialOnly"
                checked={filters.specialOnly === true}
                onChange={() => onFiltersChange({ ...filters, specialOnly: true })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{t('yes')}</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="specialOnly"
                checked={filters.specialOnly === false}
                onChange={() => onFiltersChange({ ...filters, specialOnly: false })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{t('no')}</span>
            </label>
          </div>
        </div>

        {/* Catalogs */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">{t('categories')}</h4>
          <div className="space-y-2">
            {catalogOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="catalog"
                  checked={filters.catalog === option.value}
                  onChange={() => handleCatalogChange(option.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};