import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/ManagementHeader.css";

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="flex header-container">
      <div className="container flex space-between align-center">
        <h1 className="header-title">{t("managementSytem")}</h1>
        <nav className="nav-container">
          <ul className="nav-links">
            <li>
              <Link to="/management/staff">{t("staffManagement")}</Link>
            </li>
            <li>
              <Link to="/management/course">{t("courseManagement")}</Link>
            </li>
            <li>
              {isLoggedIn ? (
                <button
                  className="auth-button logout-button"
                  onClick={handleLogout}
                >
                  {t("logout")}
                </button>
              ) : (
                <Link to="/login" className="auth-button login-button">
                  {t("login")}
                </Link>
              )}
            </li>
            <li className="language-switcher">
              <button
                className={`lang-button ${
                  i18n.language === "vi" ? "active" : ""
                }`}
                onClick={() => changeLanguage("vi")}
                title="Tiếng Việt"
              >
                VN
              </button>

              <button
                className={`lang-button ${
                  i18n.language === "en" ? "active" : ""
                }`}
                onClick={() => changeLanguage("en")}
                title="English"
              >
                EN
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
