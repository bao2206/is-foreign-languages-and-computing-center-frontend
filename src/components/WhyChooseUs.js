import React from 'react';
import { useTranslation } from 'react-i18next';

const WhyChooseUs = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      id: 1,
      icon: '👨‍🏫',
      title: t('whyChooseUs.benefit1.title'),
      description: t('whyChooseUs.benefit1.description')
    },
    {
      id: 2,
      icon: '⏰',
      title: t('whyChooseUs.benefit2.title'),
      description: t('whyChooseUs.benefit2.description')
    },
    {
      id: 3,
      icon: '🏆',
      title: t('whyChooseUs.benefit3.title'),
      description: t('whyChooseUs.benefit3.description')
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{t('whyChooseUs.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map(benefit => (
            <div key={benefit.id} className="text-center p-6">
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs; 