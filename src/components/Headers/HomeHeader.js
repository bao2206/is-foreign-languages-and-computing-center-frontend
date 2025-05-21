import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BaseHeader from './BaseHeader';

const HomeHeader = () => {
  const { t } = useTranslation();

  const navItems = [
    { path: '/', label: t('header.home') },
    { path: '/courses', label: t('header.courses') },
    { path: '/about', label: t('header.about') },
    { path: '/contact', label: t('header.contact') }
  ];

  const logo = (
    <Link to="/" className="text-2xl font-bold text-blue-600">
      {t('header.logo')}
    </Link>
  );

  return (
    <BaseHeader
      logo={logo}
      navItems={navItems}
      variant="default"
    />
  );
};

export default HomeHeader; 