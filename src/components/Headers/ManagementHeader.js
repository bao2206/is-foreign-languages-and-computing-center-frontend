import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ManagementHeader = () => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername("");
    window.location.href = "/login";
    window.location.reload();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(document.documentElement.classList.contains("dark"));
  };

  useEffect(() => {
    // Sync state if user toggles dark mode elsewhere
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Top Navbar */}
      <nav
        className={`fixed top-0 z-50 w-full border-b ${
          isDark ? "" : "bg-white"
        } border-gray-200 dark:bg-gray-900 dark:border-gray-700 transition-colors`}
      >
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              {/* Sidebar toggle button (mobile) */}
              <button
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
                aria-controls="logo-sidebar"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  />
                </svg>
              </button>
              <Link
                to="/"
                className="flex ms-2 md:me-24 items-center no-underline"
              >
                <img
                  src={require("../Images/logo.png")}
                  className="h-8 me-3"
                  alt="Logo"
                />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-gray-900 dark:text-white">
                  {t("managementSystem")}
                </span>
              </Link>
            </div>
            {/* User dropdown */}
            <div className="flex items-center ms-3">
              <div className="relative flex items-center">
                <button
                  type="button"
                  className="flex text-sm bg-gray-200 dark:bg-gray-700 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  aria-expanded="false"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="w-8 h-8 rounded-full"
                    src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                    alt="user"
                  />
                </button>
                <span className="ml-2 text-gray-900 dark:text-white font-medium">
                  {username}
                </span>
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 hidden group-hover:block">
                  {/* Implement dropdown logic if needed */}
                </div>
              </div>
              <button
                onClick={toggleLanguage}
                className="ml-4 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors no-underline"
              >
                {i18n.language === "en" ? "VI" : "EN"}
              </button>
              <button
                onClick={toggleDarkMode}
                className="ml-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors no-underline"
              >
                {isDark ? t("Light Mode") : t("Dark Mode")}
              </button>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors no-underline"
                >
                  {t("logout")}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors no-underline"
                >
                  {t("login")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto dark:bg-gray-900">
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                to="/management/staff"
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors no-underline"
              >
                <span className="ms-3">{t("userManagemetn")}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/management/course"
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors no-underline"
              >
                <span className="ms-3">{t("courseManagement")}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/management/class"
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors no-underline"
              >
                <span className="ms-3">{t("classManagement")}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/management/contact"
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors no-underline"
              >
                <span className="ms-3">{t("contactManagement")}</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default ManagementHeader;
