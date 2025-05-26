import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BaseHeader = ({
  logo,
  navItems,
  rightItems,
  className = '',
  variant = 'default' | 'management'
}) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = React.useState('');

  React.useEffect(() => {
    // Get username from localStorage when component mounts
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const getHeaderStyles = () => {
    const baseStyles = "container mx-auto px-4 py-4 flex justify-between items-center";
    const variantStyles = {
      default: "bg-white shadow-md",
      management: "bg-white shadow-md"
    };
    return `${baseStyles} ${variantStyles[variant]} ${className}`;
  };

  const getNavLinkStyles = (variant) => {
    const baseStyles = "transition-colors duration-200";
    const variantStyles = {
      default: "text-gray-700 hover:text-blue-600",
      management: "text-gray-700 hover:text-blue-600"
    };
    return `${baseStyles} ${variantStyles[variant]}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setUsername('');
    window.location.href = '/';
  };

  return (
    <header className={getHeaderStyles()}>
      <div className="flex items-center">
        {logo}
      </div>
      <nav className="hidden md:flex space-x-6">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={item.className || getNavLinkStyles(variant)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center space-x-4">
        {rightItems || (
          <>
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
            >
              {i18n.language === 'en' ? 'VI' : 'EN'}
            </button>
            {username ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                >
                  {t('header.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              >
                {t('header.login')}
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default BaseHeader; 