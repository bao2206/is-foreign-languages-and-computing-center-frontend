import React from 'react';
import { useTranslation } from 'react-i18next';

const Testimonials = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      id: 1,
      name: t('testimonials.testimonial1.name'),
      photo: 'https://via.placeholder.com/100',
      quote: t('testimonials.testimonial1.quote')
    },
    {
      id: 2,
      name: t('testimonials.testimonial2.name'),
      photo: 'https://via.placeholder.com/100',
      quote: t('testimonials.testimonial2.quote')
    },
    {
      id: 3,
      name: t('testimonials.testimonial3.name'),
      photo: 'https://via.placeholder.com/100',
      quote: t('testimonials.testimonial3.quote')
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{t('testimonials.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md text-center">
              <img src={testimonial.photo} alt={testimonial.name} className="w-20 h-20 rounded-full mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{testimonial.name}</h3>
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 