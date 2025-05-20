import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomeHeader = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            {t('header.logo')}
          </Link>
        </div>
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600">
            {t('header.home')}
          </Link>
          <Link to="/courses" className="text-gray-700 hover:text-blue-600">
            {t('header.courses')}
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-600">
            {t('header.about')}
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-blue-600">
            {t('header.contact')}
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            {i18n.language === 'en' ? 'VI' : 'EN'}
          </button>
          <Link
            to="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('header.login')}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader; 