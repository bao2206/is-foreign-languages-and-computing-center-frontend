import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  const quickLinks = [
    { name: t('footer.quickLinks.home'), path: '/' },
    { name: t('footer.quickLinks.courses'), path: '/courses' },
    { name: t('footer.quickLinks.about'), path: '/about' },
    { name: t('footer.quickLinks.contact'), path: '/contact' }
  ];

  const socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com' },
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'Instagram', url: 'https://instagram.com' }
  ];

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.quickLinksTitle')}</h3>
            <ul>
              {quickLinks.map(link => (
                <li key={link.name} className="mb-2">
                  <Link to={link.path} className="hover:underline">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.socialMediaTitle')}</h3>
            <ul>
              {socialLinks.map(link => (
                <li key={link.name} className="mb-2">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.newsletterTitle')}</h3>
            <form className="flex flex-col">
              <input type="email" placeholder={t('footer.newsletterPlaceholder')} className="px-4 py-2 mb-2 rounded-lg text-black" />
              <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                {t('footer.newsletterSubmit')}
              </button>
            </form>
          </div>
        </div>
        <div className="text-center mt-8">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 