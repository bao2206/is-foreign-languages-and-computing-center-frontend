import React from "react";
import { useTranslation } from "react-i18next";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const userRole = localStorage.getItem("userRole");
  const { t } = useTranslation();

  if (allowedRoles.includes(userRole)) {
    return children;
  }

  // Hiển thị thông báo không có quyền truy cập
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-2">
        {t("no_permission")}
      </h2>
      <p className="text-gray-700 dark:text-gray-300">
        {t("no_permission_desc")}
      </p>
    </div>
  );
};

export default ProtectedRoute;
