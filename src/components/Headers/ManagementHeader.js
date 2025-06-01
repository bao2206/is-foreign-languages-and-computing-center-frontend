import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BaseHeader from "./BaseHeader";

import { Menu, MenuItem, MenuItems, MenuButton } from "@headlessui/react";

const ManagementHeader = () => {
  const { t, i18n } = useTranslation();
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
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  const navItems = () => {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 whitespace-nowrap">
        <Link
          to="/management/staff"
          className="nav-link inline-flex justify-center gap-x-1.5 rounded-md px-2 py-2 text-sm text-black no-underline"
          style={{ textDecoration: "none" }}
        >
          <b>{t("userManagemetn")}</b>
        </Link>
        <Link
          to="/management/course"
          className="nav-link inline-flex justify-center gap-x-1.5 rounded-md px-2 py-2 text-sm text-black no-underline"
          style={{ textDecoration: "none" }}
        >
          <b>{t("courseManagement")}</b>
        </Link>
        <Link
          to="/management/class"
          className="nav-link inline-flex justify-center
          gap-x-1.5 rounded-md px-2 py-2 text-sm text-black no-underline"
          style={{ textDecoration: "none" }}
        >
          <b>{t("classManagement")}</b>
        </Link>
        <Link
          to="/management/contact"
          className="nav-link inline-flex justify-center gap-x-1.5 rounded-md px-2 py-2 text-sm text-black no-underline"
          style={{ textDecoration: "none" }}
        >
          <b>{t("contactManagement")}</b>
        </Link>
        <div className="relative inline-block text-left">
          <Menu>
            <div className="flex items-center">
              <MenuButton className="inline-flex w-full justify-center px-3 py-2 text-sm text-black">
                <b>Action</b>
              </MenuButton>
            </div>

            <MenuItems className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <MenuItem>
                  <a
                    href="#"
                    className="bg-gray-100 text-gray-900 block px-4 py-2 text-sm no-underline"
                    style={{ textDecoration: "none" }}
                  >
                    <b>Action</b>
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="bg-gray-100 text-gray-900 block px-4 py-2 text-sm no-underline"
                    style={{ textDecoration: "none" }}
                  >
                    <b>Action</b>
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="bg-gray-100 text-gray-900 block px-4 py-2 text-sm no-underline"
                    style={{ textDecoration: "none" }}
                  >
                    <b>Action</b>
                  </a>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>
    );
  };

  // const navItems = [
  //   { path: "/management/staff", label: t("staffManagement") },
  //   { path: "/management/course", label: t("courseManagement") },
  // ];

  const logo = (
    <Link
      to="/"
      className="text-2xl font-bold text-gray-800 flex items-center no-underline"
    >
      <img
        src={require("../Images/logo.png")}
        alt="Logo"
        className="h-12 w-auto mr-2"
      />
      {t("managementSystem")}
    </Link>
  );

  const rightItems = (
    <>
      <button
        onClick={toggleLanguage}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
      >
        {i18n.language === "en" ? "VI" : "EN"}
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
