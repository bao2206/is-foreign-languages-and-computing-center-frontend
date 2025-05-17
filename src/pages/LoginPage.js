// pages/LoginPage.js
import React from "react";
import LoginModal from "../components/LoginModal";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (user) => {
    // Đăng nhập thành công -> chuyển về quản lý
    navigate("/management/staff");
  };

  return <LoginModal isOpen={true} onLogin={handleLogin} onClose={() => {}} />;
}
