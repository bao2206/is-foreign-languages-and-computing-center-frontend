import React from "react";
import { useNavigate } from "react-router-dom";
import ClassLoginModal from "../../components/Login/ClassLoginModal";

const ClassLogin = () => {
  const navigate = useNavigate();

  const handleLogin = (user) => {
    // Xử lý điều hướng sau khi đăng nhập
    navigate("/class/");
  };

  const handleClose = () => {
    // Đóng modal và quay về trang chủ
    navigate("/");
  };

  return <ClassLoginModal onLogin={handleLogin} onClose={handleClose} />;
};

export default ClassLogin;
