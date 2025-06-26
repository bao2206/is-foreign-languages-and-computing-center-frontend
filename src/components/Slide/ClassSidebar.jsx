import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate} from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  User, 
  BookOpen, 
  FileText, 
  UserCheck,
  Users,
  LogOut
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUserProfile, logoutUser} from '../../services/auth';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate(); // Thêm dòng này
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const lecturerNavItems = [
    { path: '/class/dashboard', icon: Home, label: t('dashboard') },
    { path: '/class/schedule', icon: Calendar, label: t('schedule') },
    { path: '/class/classes', icon: BookOpen, label: t('classes') },
    { path: '/class/assignments', icon: FileText, label: t('assignments') },
    { path: '/class/students', icon: Users, label: t('students') },
    { path: '/class/profile', icon: User, label: t('profile') },
  ];

  const studentNavItems = [
    { path: '/class/dashboard', icon: Home, label: t('dashboard') },
    { path: '/class/schedule', icon: Calendar, label: t('schedule') },
    { path: '/class/classes', icon: BookOpen, label: t('classes') },
    { path: '/class/assignments', icon: FileText, label: t('assignments') },
    { path: '/class/attendance', icon: Users, label: t('attendance') },
    { path: '/class/profile', icon: UserCheck, label: t('profile') },
  ];

  const navItems = user?.role === 'lecturer' ? lecturerNavItems : studentNavItems;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Thêm logic logout tại đây (ví dụ: xóa token, chuyển hướng, v.v.)
    logoutUser()
      .then(() => {
        console.log('User logged out successfully');
        navigate("/class/login", { replace: true }); // Chuyển hướng về trang đăng nhập
      })
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">{t("Class Management")}</h1>
        <p className="text-sm text-gray-600 mt-1">{user?.authId.role.name === 'teacher' ? t('lecturerPortal') : t('studentPortal')}</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <img
            src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
            alt={user?.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;