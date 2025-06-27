import React, { useState, useEffect } from "react";
import { Bell, Search, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getUserProfile } from "../../services/auth";

const Header = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLanguageOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4"></div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              {i18n.language === "en" ? "EN" : "VI"}
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isLanguageOpen && (
              <div className="absolute top-full mt-1 w-20 bg-white border border-gray-200 rounded-lg shadow-md z-10">
                <button
                  onClick={() => changeLanguage("en")}
                  className="w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage("vi")}
                  className="w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                >
                  Tiếng Việt
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || require("../Images/user_Img.png")}
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.authId.role.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
