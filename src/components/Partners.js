import React from 'react';
import { useTranslation } from 'react-i18next';

const Partners = () => {
  const { t } = useTranslation();

  const partners = [
    {
      id: 1,
      name: t('partners.partner1.name'),
      logo: 'https://via.placeholder.com/150'
    },
    {
      id: 2,
      name: t('partners.partner2.name'),
      logo: 'https://via.placeholder.com/150'
    },
    {
      id: 3,
      name: t('partners.partner3.name'),
      logo: 'https://via.placeholder.com/150'
    },
    {
      id: 4,
      name: t('partners.partner4.name'),
      logo: 'https://via.placeholder.com/150'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{t('partners.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {partners.map(partner => (
            <div key={partner.id} className="flex justify-center items-center">
              <img src={partner.logo} alt={partner.name} className="max-w-full h-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners; 