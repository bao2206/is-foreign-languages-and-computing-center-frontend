import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-blue-50 py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
          {t('hero.headline')}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {t('hero.subheadline')}
        </p>
        <Link
          to="/courses"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {t('hero.cta')}
        </Link>
      </div>
    </section>
  );
};

export default HeroSection; 