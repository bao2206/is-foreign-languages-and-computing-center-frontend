import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BaseHeader from "./BaseHeader";

const ManagementHeader = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    // Get username from localStorage if it exists
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { path: "/management/staff", label: t("staffManagement") },
    { path: "/management/course", label: t("courseManagement") }
  ];

  const logo = (
    <Link to="/management" className="text-2xl font-bold text-gray-800">
      {t("managementSystem")}
    </Link>
  );

  const rightItems = (
    <>
      <button
        onClick={toggleLanguage}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
      >
        {i18n.language === 'en' ? 'VI' : 'EN'}
      </button>
      {isLoggedIn ? (
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">{username}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t("logout")}
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t("login")}
        </Link>
      )}
    </>
  );

  return (
    <BaseHeader
      logo={logo}
      navItems={navItems}
      rightItems={rightItems}
      variant="management"
    />
  );
};

export default ManagementHeader;
