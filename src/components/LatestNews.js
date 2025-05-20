import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LatestNews = () => {
  const { t } = useTranslation();

  const news = [
    {
      id: 1,
      title: t('latestNews.news1.title'),
      excerpt: t('latestNews.news1.excerpt'),
      link: '/news/1'
    },
    {
      id: 2,
      title: t('latestNews.news2.title'),
      excerpt: t('latestNews.news2.excerpt'),
      link: '/news/2'
    },
    {
      id: 3,
      title: t('latestNews.news3.title'),
      excerpt: t('latestNews.news3.excerpt'),
      link: '/news/3'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{t('latestNews.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map(item => (
            <div key={item.id} className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.excerpt}</p>
              <Link to={item.link} className="text-blue-600 hover:underline">
                {t('latestNews.readMore')}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestNews; 