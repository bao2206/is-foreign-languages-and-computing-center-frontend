import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";

export default function LoginPage() {
  const [loginType, setLoginType] = useState(null);
  const navigate = useNavigate();

  // Bước chọn loại đăng nhập
  if (!loginType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-xs">
          <h2 className="text-xl font-bold mb-6 text-center">
            Chọn loại đăng nhập
          </h2>
          <button
            className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setLoginType("staff")}
          >
            Đăng nhập nhân viên
          </button>
          <button
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => setLoginType("class")}
          >
            Đăng nhập giáo viên hoặc học viên
          </button>
        </div>
      </div>
    );
  }

  // Đăng nhập staff
  if (loginType === "staff") {
    const handleLogin = (user) => {
      const userRole = user.role;
      // Các role staff/admin
      if (
        userRole === "6800d06932b289b2fe5b0409" ||
        userRole === "6800d06932b289b2fe5b0406" ||
        userRole === "6800d06a32b289b2fe5b040c" ||
        userRole === "6800d06a32b289b2fe5b040f" ||
        userRole === "6800d06a32b289b2fe5b0412"
      ) {
        navigate("/management/staff");
      } else {
        navigate("/");
      }
    };
    const handleClose = () => {
      setLoginType(null);
    };
    return (
      <LoginModal isOpen={true} onLogin={handleLogin} onClose={handleClose} />
    );
  }

  // Đăng nhập giáo viên/học viên
  if (loginType === "class") {
    // Điều hướng sang trang login riêng cho giáo viên/học viên
    navigate("/class/login");
    return null;
  }

  return null;
}
