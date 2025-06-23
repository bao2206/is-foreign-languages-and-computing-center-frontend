import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * @param {Object} props
 * @param {string} props.sortBy
 * @param {(sort: string) => void} props.onSortChange
 */
export const SortControls = ({ sortBy, onSortChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-gray-600" />
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="name_asc">{t('sortByNameAsc')}</option>
        <option value="name_desc">{t('sortByNameDesc')}</option>
        <option value="price_asc">{t('sortByPriceAsc')}</option>
        <option value="price_desc">{t('sortByPriceDesc')}</option>
      </select>
    </div>
  );
};