import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BaseHeader = ({
  logo,
  navItems,
  rightItems,
  className = "",
  variant = "default" | "management",
}) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = React.useState("");
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  const getHeaderStyles = () => {
    const baseStyles = "w-full px-4 py-4 flex justify-between items-center";
    const variantStyles = {
      default: "bg-white shadow-md",
      management: "bg-white shadow-md",
    };
    return `${baseStyles} ${variantStyles[variant]} ${className}`;
  };

  const getNavLinkStyles = (variant) => {
    const baseStyles = "transition-colors duration-200";
    const variantStyles = {
      default: "text-gray-700 hover:text-blue-600",
      management: "text-gray-700 hover:text-blue-600",
    };
    return `${baseStyles} ${variantStyles[variant]}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    setUsername("");
    window.location.href = "/";
  };

  return (
    <header className={getHeaderStyles()}>
      <div className="flex items-center">{logo}</div>

      {/* Hamburger menu for mobile */}
      <button
        className="md:hidden ml-2 p-2 rounded hover:bg-gray-200"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Desktop nav and rightItems */}
      <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center">
        {variant === "management"
          ? navItems()
          : navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={item.className || getNavLinkStyles(variant)}
              >
                {item.label}
              </Link>
            ))}
      </nav>
      <div className="hidden md:flex items-center space-x-4">
        {rightItems || (
          <>
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
            >
              {i18n.language === "en" ? "VI" : "EN"}
            </button>
            {username ? (
              <>
                <span className="text-gray-700">{username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                >
                  {t("header.logout")}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              >
                {t("header.login")}
              </Link>
            )}
          </>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute right-4 top-16 bg-white shadow-lg rounded-md z-50 flex flex-col md:hidden min-w-[200px] py-2 px-3 space-y-2 border">
          <div>
            {variant === "management"
              ? navItems()
              : navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className={item.className || getNavLinkStyles(variant)}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
          </div>
          {/* Divider */}
          <hr className="my-2" />
          <div>
            {rightItems || (
              <div className="flex flex-col items-start space-y-2">
                {username && (
                  <div className="flex items-start">
                    <span className="text-gray-700">Welcome, {username}</span>
                  </div>
                )}
                <div className="flex flex-row items-center w-full space-x-2">
                  <button
                    onClick={toggleLanguage}
                    className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200 text-center"
                  >
                    {i18n.language === "en" ? "VI" : "EN"}
                  </button>
                  {username ? (
                    <button
                      onClick={handleLogout}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 text-center"
                    >
                      {t("header.logout")}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-center"
                    >
                      {t("header.login")}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default BaseHeader;