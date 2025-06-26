import React, { useState, useEffect } from "react";
import { Bell, Search, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getUserProfile } from "../../services/auth";

const Header = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4"></div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img
              src={
                user?.avatar ||
                "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
              }
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
